require("./setupIntegration");

var context = require.context("./integration", true, /\.jsx?$/);
context.keys().forEach(context);
