# promise的基本用法

```js
var promise = new Promise(function(resolve, reject) {
  if (/* 异步操作成功 */){
    resolve(value);
  } else {
    reject(error);
  }
});
promise
.then(function(value) {
  // 如果调用了resolve方法，执行此函数
}, function(value) {
  // 如果调用了reject方法，执行此函数
});

```

其实Promise函数的使命，就是构建出它的实例，并且负责帮我们管理这些实例。而这些实例有以下三种状态：

1. pending: 初始状态，位履行或拒绝
2. fulfilled: 意味着操作成功完成
3. rejected: 意味着操作失败

`new Promise` 只接受一个函数为参数，这个函数在创建的时候就立即执行了。

# promise原理

promise 从设计模式上来讲，是观察者模式



## 观察者模式 

观察者模式是基于订阅-发布模式的，但是又有些许区别, 发布 emit 和订阅 on 两者没有直接关系， 观察者模式把 观察者 放到被观察者中，二者都是 一种一对多的关系 [fn,fn,fn]。

举个生活中的例子： 一天 A 去售楼处看房子，到了售楼处才发现楼盘都售光了，但是值得高兴的是下周可能会有一批尾楼盘放出，于是 A 请售楼小姐记下他的信息，等楼盘放出后给他发信息。 不久后 B 、C 、D 都来看房子都遇见同样的问题，售楼小姐依次记录了他们的信息。一周后，楼盘放出了，售楼小姐拿出手机依次给 A、B 、C 、D... 客人发了信息（发完崩溃了。。。）。

这就是订阅-发布模式。

后来售楼小姐认识了一个程序猿小哥哥，和他说了这件事，程序猿小哥哥说，你把 A、B 、C 、D... 的信息给我，我帮你操作，这样你就不用一个一个发信息了。

下面看看程序猿小哥哥的操作：

```js
// 观察者模式: 把 观察者 放到被观察者中

class Subject { // 被观察者
    constructor() {
      this.stack = [];
      this.name = '';
    }
    attach = (observer) => {
      this.stack.push(observer);
    }
    setName = (newName) => {
      this.name = newName;
      this.stack.map( o => o.mobile(newName))
    }
}
  
class Observer { // 观察者
    constructor(username) {
      this.username = username;
    }
    mobile = (name) => {
      console.log('尊敬的用户' + this.username + '您好！您关注的'+ name + '开售了，快来看看吧')
    }
}
  
let o1 = new Observer('A');
let o2 = new Observer('B');// 收集  A、B ... 的信息
let s = new Subject();
s.attach(o1);
s.attach(o2); // 将 A、B ... 的信息放入待执行队列中
s.setName('万科楼盘') // 当楼盘信息出来后，主动给 A、B... 发信息
  
```

## 手写一版 promise

下面我们手写一版 promise，如下：

```js

const SUCCESS = 'fulfilled'
const FAIL = 'rejected';
const PENDING = 'pending'

class Promise {
  constructor(executor) {
  	 this.status = PENDING;
    this.value = undefined;  // 成功返回
    this.reason = undefined; // 失败返回
    this.onResolvedCallbacks = []; // 存储成功的所有的回调 只有pending的时候才存储
    this.onRejectedCallbacks = []; // 存储所有失败的

    try {
        executor(this.resolve, this.reject);
    } catch(e){
        reject(e);
    }
  }

  then = (onFulfilled, onRejected) => {
  	if(this.status === SUCCESS){
        onFulfilled(this.value);
    }
    if(this.status === FAIL){
        onRejected(this.reason);
    }
    if(this.status === PENDING){
        this.onResolvedCallbacks.push(()=>{
            onFulfilled(this.value);
        });
        this.onRejectedCallbacks.push(()=>{
            onRejected(this.reason);
        })
    }
  }

  resolve = (value) => {
  		if(this.status === PENDING){
		  	 this. value = value;
		  	 this.status = SUCCESS;
		    this.onResolvedCallbacks.forEach((fn) => {
		      fn(value)
		    })
    	}
  }

  reject = (reason) => {
  		if(this.status === PENDING){
		    this. reason = reason;
		    this.status = FAIL;
			 this.onRejectedCallbacks.forEach((fn) => {
		      fn(reason)
		    })
		}
  }
}

```

promise 和 fetch 简单结合一下：

```js
let fetchData = new Promise((resovle, reject) => {
  fetch(url)
  .then(data => data.json())
  .then(data => {
     if(data.success) {
        return resovle(data)
     }
     else {
       return reject(data)
     }
  })
}) 

```

当我们使用链式调用法，如下：

```js

fetchData
.then(res => {
  console.log(res)
})
.then(res => {
  console.log(this.userInfo)
})

```

当进去第二个then后，我们发现，程序因为找不到then方法而导致报错。

![image](https://user-images.githubusercontent.com/9944527/38483578-083a9b1e-3c06-11e8-8eb6-301efe535aac.png)

<strong>promise的链式操作关键是：</strong> Promise.prototype.then方法接受一个函数为参数，并返回的是一个新的Promise对象，因此可以采用链式写法。

想让then方法支持链式调用，其实也是很简单的：

```js
then(onFulfilled, onRejected) {
	....
	
	return this
}

```
没错，就是这么简单的一句，就可以很魔法的实现链式调用。



> 问题1:
> 
> 如果用户再then函数里面注册的仍然是一个Promise，该如何解决？

```js 

Page({
  onShow: function() {
    HTTP.GET('v2/user/invest/info')
    .then(res => {
      this.userInfo = res
      console.log(this.userInfo)
      return HTTP.GET('v2/report/invest/do/list')
    })
    .then(data => {
      console.log(data)
    })
  }
})
```

如果继续使用上面的promise，`HTTP.GET('v2/report/invest/do/list')`返回内容无法是无法获取的:
<img width="718" alt="callback 2x" src="https://user-images.githubusercontent.com/9944527/38545690-36cce8ba-3cdd-11e8-8b07-50024f2528b5.png">

如图，data 和 res 返回内容一致，这显然不是我们想要的。

> 链式Promise是指在当前promise达到fulfilled状态后，即开始进行下一个promise（后邻promise）。那么我们如何衔接当前promise和后邻promise呢？

我们可以说尝试着在 then 方法里面 return 一个 promise, 事实上Promises/A+规范中的2.2.7就是这么说哒～

继续改造我们的promise：


```js
// 在Promise类外添加一个resolvePromise方法
function resolvePromise(promise2, x,resolve,reject) { // 考虑的非常全面
    if(promise2 === x){
       return reject(new TypeError('TypeError: Chaining cycle detected for promise #<Promise>'));
    }
    // 判断x的类型
    // promise 有n种实现 都符合了这个规范 兼容别人的promise

    // 怎么判断 x是不是一个promise 看他有没有then方法
    if(typeof x === 'function' || (typeof x === 'object' && x != null)){
      try{
        let then = x.then; // 去then方法可能会出错
        if(typeof then === 'function'){ // 我就认为他是一个promise
           then.call(x,y=>{ // 如果promise是成功的就把结果向下传，如果失败的就让下一个人也失败
              resolvePromise(promise2,y,resolve,reject); // 递归
           },r=>{
              reject(r);
           }) // 不要使用x.then否则会在次取值
        }else{ // {then:()=>{}}
          resolve(x);
        }
      }catch(e){
        reject(e);
      }
    }else{ // x是个？ 常量 
      resolve(x);
    }
}

...
then(onFulfilled, onRejected) {
    let promise2; 
    // 可以不停的调用then方法,返还了一个新的promise
    // 异步的特点 等待当前主栈代码都执行后才执行
    promise2 = new Promise((resolve, reject) => {
      if (this.status === SUCCESS) {
        setTimeout(() => {
          try {
            // 调用当前then方法的结果，来判断当前这个promise2 是成功还是失败
            let x = onFulfilled(this.value);
            // 这里的x是普通值还是promise
            // 如果是一个promise呢？
            resolvePromise(promise2, x, resolve, reject);
          } catch (err) {
            reject(err);
          }
        });
      }
      if (this.status === FAIL) {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (err) {
            reject(err);
          }
        });
      }
      if (this.status === PENDING) {
        this.onResolvedCallbacks.push(()=>{
          setTimeout(() => {
            try {
              let x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (err) {
              reject(err);
            }
          });
        });
        this.onRejectedCallbacks.push(()=> {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (err) {
              reject(err);
            }
          });
        });
      }
    });
    return promise2; // 之前例子中的this
  }

...

```



## 总结
现在回顾下Promise的实现过程，其主要使用了设计模式中的观察者模式：

1. 通过Promise.then和Promise.catch方法将观察者方法注册到被观察者Promise对象中，同时返回一个新的Promise对象，以便可以链式调用。

2. 被观察者管理内部pending、fulfilled和rejected的状态转变，同时通过构造函数中传递的resolve和reject方法以主动触发状态转变和通知观察者。