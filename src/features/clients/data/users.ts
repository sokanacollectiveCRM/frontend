import { faker } from '@faker-js/faker'

export const users = Array.from({ length: 20 }, () => {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  return {
    id: faker.string.uuid(),
    firstName,
    lastName,
    contractType: faker.helpers.arrayElement([
      'PostPartum',
      'Labor Support',
      'Lactation Support'
    ]),
    requestedDate: faker.date.past(),
    updatedAt: faker.date.recent(),
    status: faker.helpers.arrayElement([
      'In Progress',
      'Active',
      'Completed',
    ]),
  }
})
