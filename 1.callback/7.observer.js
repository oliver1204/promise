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
  let o2 = new Observer('B');
  let s = new Subject();
  s.attach(o1);
  s.attach(o2);
  s.setName('万科楼盘')
