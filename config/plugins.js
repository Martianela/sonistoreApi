module.exports = ({ env }) => {
  return {
    "user-permisssions": {
      config: {
        jwtSecret: env("JWT_SECRET"),
      },
    },
  };
};
