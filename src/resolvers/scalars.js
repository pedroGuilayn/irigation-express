
const { GraphQLScalarType, Kind } = require('graphql');

// Scalar para DateTime (com hora)
const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'Data e hora no formato ISO 8601',
  
  serialize(value) {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  },
  
  parseValue(value) {
    return new Date(value);
  },
  
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
      return new Date(ast.value);
    }
    return null;
  },
});

// Scalar para Date (apenas data)
const DateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Data no formato YYYY-MM-DD',
  
  serialize(value) {
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }
    return value;
  },
  
  parseValue(value) {
    return new Date(value);
  },
  
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

module.exports = {
  DateTime: DateTimeScalar,
  Date: DateScalar,
};
