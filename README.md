# Getting Started

1. clone the repository

2. install node modules

```sh
npm install
```

3. create the following files:

#### applied.txt

```sh
touch applied.txt && echo "[]" >> applied.txt
```

#### secrets.js

```node
module.exports = {
  fullName: 'FILL_ME_IN',
  email: 'FILL_ME_IN',
  phone: 'FILL_ME_IN',
  linkedin: 'FILL_ME_IN',
  github: 'FILL_ME_IN',
  otherWebsite: 'FILL_ME_IN',
  message: 'FILL_ME_IN',
  fileLocation: 'FILL_ME_IN',
};
```

fileLocation - absolute file path for resume

4. apply to jobs at Blend without lifting a finger

```sh
node apply.js
```

## Notes

1. make sure to customize the code for your own application
