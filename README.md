This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, install environment:

```bash
npm install
```

Next, run the development server:

```bash
npm start
# or
yarn start
```

Finally, start project as service:

https://medium.com/@devesu/how-to-start-reactjs-application-with-pm2-as-a-service-linux-macos-854d5df3fcf1

```bash
npm install pm2@latest -g

# start service
pm2 start --name solucky-frontend npm -- start

# end service
pm2 stop solucky-frontend
```