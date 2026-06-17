const bcrypt = require('bcryptjs');

const match1 = bcrypt.compareSync('Admin@123', '$2a$10$iri6Se/rxGZOXillLf42q.qog2.rSdWIHzUA.oqsmuuiemKhKKmFW');
const match2 = bcrypt.compareSync('Manikanta123', '$2a$10$SZeJaqwm0elg4lqp0kjiH.67HenLia0FBwWsM7BBx5DmRtwGmvqJi');

console.log('Admin match:', match1);
console.log('User match:', match2);
