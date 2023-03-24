const stripe = require("stripe")(
  "sk_test_51MXTNISIcKPik3mXaoZyzgGh5mGFjO9xwJB7yziQtdoYnK1xcE3u027uh6GuYYCZFeniLkLxE5lbEmEUpnYr7UC8009hTuSR9F"
);
("use strict");

/**
 * order controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::order.order", ({ strapi }) => ({
  async create(ctx) {
    const { email, products } = ctx.request.body;
    const lineItems = await Promise.all(
      products.map(async (pro) => {
        const item = await strapi
          .service("api::product.product")
          .findOne(pro.id);
        //  console.log(item);
        return {
          price_data: {
            currency: "inr",
            product_data: {
              name: item.title,
            },
            unit_amount: item.price * 100,
          },
          quantity: pro.quantity,
        };
      })
    );
    console.log(lineItems);
    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        success_url: process.env.CLIENT_URL + "?success=true",
        success_url: process.env.CLIENT_URL + "?success=false",
        line_items: lineItems,
        payment_method_types: ["card"],
      });
      console.log(session.id);
      await strapi.service("api::order.order").create({
        data: {
          products,
          stripeid: session.id,
        },
      });

      return { stripeSession: session };
    } catch (error) {
      console.log(error);
      ctx.response.status = 500;
      return error;
    }
  },
}));
