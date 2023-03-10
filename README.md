## Overview

A [Nest](https://github.com/nestjs/nest) application, a progressive Node.js framework that provides a simple and efficient way to interact with Google Tag Manager (GTM) and the dataLayer on websites. The goal of this application is to make it easier to keep track of dataLayer and GTM information, patching examination results in [Airtable](https://www.airtable.com/), a cloud-based platform for organizing and managing data collaboratively.

## Key Features

- Inspect the dataLayer with a static URL
- Automatically perform Google recorded operations and collect dataLayer information (experimental, ongoing) \
  The operation is recorded manually by Google Dev Tool recorder, in form of JSON. The operation recordings are saved in the `recordings` folder, and it's mandatory to include the settings in the `configs` folder. The recording is a one-time chore to enable repeatable test automation.
- Inspect and analyze via GTM
- Easily patch inspection results back to Airtable

## Usage (In development mode)

Here's an example of how to use the application to inspect the dataLayer on a website:

- Inspect the dataLayer with a static URL\
  `http://localhost:3000/puppeteer/data-layer?url=<websiteUrl>`

- Perform recorded operations (experimental): please see recordings example folder \
  `http://localhost:3000/puppeteer/action/eeListClick`

- Check installed GTM \
  `http://localhost:3000/puppeteer/detect-gtm?url=<websiteUrl>`

There are also other endpoints. Please see `controller.ts` under the `src` folder.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
