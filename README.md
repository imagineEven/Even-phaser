说明：
安装node.js

1. git clone这个项目  
2. 最好安装一下cnpm，因为npm安装速度太慢，经常失败： npm install -g cnpm --registry=https://registry.npm.taobao.org  
3. 进入到项目根目录，安装依赖：npm i或者cnpm i  
4. npm run dev是编译，打包，部署项目，他会自动部署完打开浏览器运行项目。之后改代码无需重复npm run dev过程，也无需自己刷新浏览器页面  
5. npm run unit是使用单元测试，并且检查覆盖率。单元测试写在test目录里，里面有例子。
6. webpack.config.js.temp 文件中definePlugin有个Int类型的全局变量'optionsType' 这个主要是用来设置不同环境的资源路径。
#   P h a s e r  
 