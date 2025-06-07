<<<<<<< HEAD
export default {
  providers: [
    {
      domain: process.env.CLERK_SIGNING_KEY,
      applicationID: "convex",
    },
  ]
};
=======

const authConfig = {
    providers: [
      {
        domain:  process.env.CLERK_FRONTEND_API_URL,
        applicationID: "convex",
        "type": "oidc",
        "issuer": process.env.CLERK_ISSUER,
        "jwks_url": process.env.CLERK_JWKS_URL,
        "audience": process.env.CLERK_AUDIENCE
      },
    ],
  };

export default authConfig;
>>>>>>> origin/main
