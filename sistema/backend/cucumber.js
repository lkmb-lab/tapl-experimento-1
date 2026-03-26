module.exports = {
  default: {
    paths: ["tests/acceptance/features/**/*.feature"],
    require: ["tests/acceptance/steps/**/*.ts"],
    requireModule: ["ts-node/register"],
    format: ["progress"]
  }
};
