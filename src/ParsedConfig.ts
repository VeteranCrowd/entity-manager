import { counting, sort } from 'radash';
import { z } from 'zod';

const defaultShardBump = { timestamp: 0, nibbleBits: 1, nibbles: 0 };

const validateArrayUnique = <T>(
  arr: T[],
  ctx: z.RefinementCtx,
  identity: (item: T) => string | number | symbol = (item) =>
    item as unknown as string | number | symbol,
  path: (string | number)[] = [],
) => {
  const counts = counting(arr, identity);

  for (const [element, count] of Object.entries(counts)) {
    if (count > 1)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `duplicate array element '${element}'`,
        path,
      });
  }
};

const validateKeyExclusive = (
  key: string,
  label: string,
  ref: string[],
  ctx: z.RefinementCtx,
) => {
  if (ref.includes(key))
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `${label} '${key}' is not exclusive`,
    });
};

export const configSchema = z
  .object({
    entities: z
      .record(
        z
          .object({
            defaultLimit: z
              .number()
              .int()
              .positive()
              .safe()
              .optional()
              .default(10),
            defaultPageSize: z
              .number()
              .int()
              .positive()
              .safe()
              .optional()
              .default(10),
            generated: z
              .record(
                z.object({
                  elements: z
                    .array(z.string().min(1))
                    .nonempty()
                    .superRefine(validateArrayUnique),
                  sharded: z.boolean().optional().default(false),
                }),
              )
              .optional()
              .default({}),
            indexes: z
              .record(
                z
                  .array(z.string().min(1))
                  .nonempty()
                  .superRefine(validateArrayUnique),
              )
              .optional()
              .default({}),
            shardBumps: z
              .array(
                z.object({
                  timestamp: z.number().nonnegative().safe(),
                  nibbleBits: z.number().int().min(1).max(5),
                  nibbles: z.number().int().min(0).max(40),
                }),
              )
              .optional()
              .default([defaultShardBump])

              // validate shardBump uniqueness by timestamp.
              .superRefine((val, ctx) => {
                validateArrayUnique(val, ctx, ({ timestamp }) => timestamp, [
                  'timestamp',
                ]);
              })

              .transform((val) => {
                // sort shardBumps by timestamp.
                let sorted = sort(val, ({ timestamp }) => timestamp);

                // prepend defaultShardBump if missing zero-timestamp bump.
                if (sorted[0].timestamp !== 0) {
                  sorted = [defaultShardBump, ...sorted];
                }

                return sorted;
              })

              // validate shardBump nibbles mootonically increase with timestamp.
              .superRefine((val, ctx) => {
                if (val.length > 1) {
                  for (let i = 1; i < val.length; i++)
                    if (val[i].nibbles <= val[i - 1].nibbles)
                      ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: `shardBump nibbles do not monotonically increase at timestamp ${val[i].timestamp.toString()}`,
                        path: [i],
                      });
                }
              }),
            timestampProperty: z.string().min(1),
            uniqueProperty: z.string().min(1),
          })
          .superRefine((data, ctx) => {
            const generatedKeys = Object.keys(data.generated);

            // validate timestampProperty is not a generated key.
            validateKeyExclusive(
              data.timestampProperty,
              'timestampProperty',
              generatedKeys,
              ctx,
            );

            // validate uniqueProperty is not a generated key.
            validateKeyExclusive(
              data.uniqueProperty,
              'uniqueProperty',
              generatedKeys,
              ctx,
            );
          }),
      )
      .optional()
      .default({}),
    hashKey: z.string().optional().default('hashKey'),
    uniqueKey: z.string().optional().default('uniqueKey'),
  })
  .superRefine((data, ctx) => {
    const reservedKeys = Object.values(data.entities).reduce(
      (reserved, { generated, timestampProperty, uniqueProperty }) =>
        new Set([
          ...reserved,
          ...Object.keys(generated),
          timestampProperty,
          uniqueProperty,
        ]),
      new Set<string>(),
    );

    // validate hashKey is not a reserved key.
    validateKeyExclusive(
      data.hashKey,
      'hashKey',
      [...reservedKeys, data.uniqueKey],
      ctx,
    );

    // validate uniqueKey is not a reserved key.
    validateKeyExclusive(
      data.uniqueKey,
      'uniqueKey',
      [...reservedKeys, data.hashKey],
      ctx,
    );
  });

export type ParsedConfig = z.infer<typeof configSchema>;