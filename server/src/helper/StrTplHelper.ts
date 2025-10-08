
// 声明 RJS 变量
let RJS: any;
export function initRJS() {
  let rjs: any;
  try {
    // 直接加载 dist/rjs.js 文件
    const rjsPath = require.resolve('razor-js-template/dist/rjs.js');
    console.log('RJS file path:', rjsPath);
    
    // 直接 require 这个文件
    const rjsModule = require(rjsPath);
    console.log('Direct rjs.js require result:', rjsModule);
    
    if (rjsModule && typeof rjsModule === 'function') {
      RJS = rjsModule;
      
      // 尝试不同的构造函数参数
      try {
        // 尝试无参数构造
        rjs = new RJS();
        console.log('RJS instance created with no parameters');
        
        // 检查是否有静态 compile 方法，如果有则优先使用
        if (RJS.compile && typeof RJS.compile === 'function') {
          console.log('Using static compile method instead of instance');
          rjs = RJS; // 使用类本身，调用静态方法
        }
        
      } catch (error) {
        console.log('No parameter constructor failed, trying with empty object:', (error as Error).message);
        try {
          rjs = new RJS({});
          console.log('RJS instance created with empty object');
        } catch (error2) {
          console.log('Empty object constructor failed, trying with include function:', (error2 as Error).message);
          try {
            rjs = new RJS({
              include: (filePath: string, data: any) => {
                console.log('Include called with:', filePath, data);
                return `<!-- Include: ${filePath} -->`;
              }
            });
            console.log('RJS instance created with include function');
          } catch (error3) {
            console.log('All constructor attempts failed, using static method:', (error3 as Error).message);
            // 如果构造函数都失败，尝试使用静态方法
            if (RJS.compile && typeof RJS.compile === 'function') {
              rjs = RJS;
              console.log('Using RJS class directly with static compile method');
            } else {
              throw new Error('RJS class has no usable compile method');
            }
          }
        }
      }
    } else {
      throw new Error('Direct rjs.js file loading failed');
    }
  } catch (error) {
    console.error('Failed to load rjs.js directly:', error);
  }
  return rjs;
}