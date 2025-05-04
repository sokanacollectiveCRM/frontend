import { faker } from '@faker-js/faker';
export var users = Array.from({ length: 20 }, function () {
    var firstName = faker.person.firstName();
    var lastName = faker.person.lastName();
    return {
        id: faker.string.uuid(),
        firstName: firstName,
        lastName: lastName,
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
    };
});
