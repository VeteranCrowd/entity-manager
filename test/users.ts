import { faker } from '@faker-js/faker';
import { normstr } from '@karmaniverous/string-utilities';

import { type Entity } from '../src/Config';

export interface User extends Entity {
  created: number;
  firstNameCanonical: string;
  firstNameRK?: never;
  lastNameCanonical: string;
  lastNameRK?: never;
  phone?: string;
  updated: number;
  userId: string;
}

export const getUsers = (count = 1, daysFromNow = 0, forDays = 1) => {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const users: User[] = [];

  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    const timestamp = faker.date
      .soon({ days: forDays, refDate: now + day * daysFromNow })
      .getTime();

    users.push({
      created: timestamp,
      firstName,
      firstNameCanonical: normstr(firstName)!,
      lastName,
      lastNameCanonical: normstr(lastName)!,
      updated: timestamp,
      userId: faker.string.nanoid(),
    });
  }

  return users;
};
