import { Metric, MetricsHandler } from '../src/metrics'
import { UserHandler, User } from '../src/user'

//Populate Db

const dbUser = new UserHandler('./db/users');
const dbMet = new MetricsHandler('./db/metrics');

const users = [
  new User("Jean", "jean@gmail.com", "1"),
  new User("Charles", "charles@gmail.com", "1"),
  new User("Lenna", "lenna@gmail.com", "3")
];


users.forEach(user => {
  dbUser.save(user, (err: Error | null) => {
    if(err) throw err;
    console.log('User : ' + user.username + ' added to the db');
  });

  let met = [
    new Metric(`${new Date('2019-11-04 14:00 UTC').getTime()}`, 12),
    new Metric(`${new Date('2019-11-04 14:15 UTC').getTime()}`, 10),
    new Metric(`${new Date('2019-11-04 14:30 UTC').getTime()}`, 8)
  ];

  dbMet.save(user.username, met, (err: Error | null) => {
    if (err) throw err
    console.log('Data populated')
  });

})


