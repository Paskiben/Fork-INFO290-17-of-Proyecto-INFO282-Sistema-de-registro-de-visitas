module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
      '@babel/preset-env',
      '@babel/preset-react',
      
    
      
    ],
    plugins: [
      ['@babel/preset-env', {}],
      ['@babel/preset-env', { targets: { node: 'current' } }, 'preset-env-node'],
      ['@babel/plugin-preset-env']
    ],
  };

};
