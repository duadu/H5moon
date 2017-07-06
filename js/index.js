$(function () {
  var gameMonitor = {
    // 获取屏幕大小
    screenWidth: $(window).width(),
    screenHeight: $(window).height(),
    bgWidth: $(window).width(),
    bgHeight: $(window).width() * 1126 / 320,
    bgDistance: 0,  //背景位置
    bgLoop: 0,  //背景的重绘次数
    bgSpeed: 2,
    timmer: null,
    moonList: [],
    time: 0,
    score: 0,
    im: new ImageMonitor(),
    eventType: {
      start: 'touchstart',
      move: 'touchmove',
      end: 'touchend'
    },
    init: function () {
      var _this = this,
          canvas = document.getElementById('stage'),
          ctx = canvas.getContext('2d');
          ctx.drawImage(canvas, 100, 100, 80, 80);
      // 绘制背景
      _this.bg = new Image();
      _this.bg.onload = function () {
        ctx.drawImage(_this.bg, 0, 0, _this.bgWidth, _this.bgHeight);
      }
      _this.bg.src = 'imgs/bg.jpg';

      _this.initListener(ctx);
    },
    initListener: function (ctx) {
      var _this = this,
          body = $(document.body);
      body.on(gameMonitor.eventType.start, '#guidePanel', function () {
        $(this).hide();
        _this.ship = new Ship(ctx);
        _this.ship.paint();
        _this.ship.controll();
        _this.run(ctx);
      });
      body.on(gameMonitor.eventType.start, 'replay, .playagain', function () {
        $('#resultPanel').hide();
        var canvas = document.getElementsById('stage');
        var ctx = canvas.getContext('2d');
        _this.ship = new Ship(ctx);
        _this.ship.controll();
        _this.reset();
        _this.run(ctx);
      })
    },
    rollBg: function (ctx) {
      if (this.bgDistance >= this.bgHeight) {
        this.bgLoop = 0;
      }
      this.bgDistance = ++
       this.bgLoop * this.bgSpeed;
      // 背景图片的无缝滚动(绘制两次)
      ctx.drawImage(this.bg, 0, this.bgDistance - this.bgHeight, this.bgWidth, this.bgHeight);
      ctx.drawImage(this.bg, 0, this.bgDistance, this.bgWidth, this.bgHeight);
    },
    genorateMoon: function () {
      this.genRate = 50; //产生月饼的频率
      if (Math.random() * this.genRate > this.genRate - 1) {
        var left = Math.random() * (this.screenWidth - 50);
        var type = Math.floor(left) % 2 == 0 ? 0 : 1;
        var id = this.moonList.length;
        var moon = new Moon(type, left, id);
        this.moonList.push(moon);
      }
    },
    stop: function () {
      var _this = this;
      $('#stage').off(gameMonitor.eventType.start + ' ' + gameMonitor.eventType.move);
      setTimeout(function () {
        clearTimeout(_this.timmer);
      }, 0);
    },
    getScore: function () {
      var time = Math.floor(this.time / 60);
      var score = this.score;
      var user = 1;
      if (score == 0) {
        $('#scorecontent').html('真遗憾，您竟然<span class="lighttext">一个</span>月饼都没有抢到！');
        $('.btn1').text('大侠请重新来过').removeClass('share').addClass('playagain');
        $('#fenghao').removeClass('geili yinhen').addClass('yinhen');
        return;
      }
      else if(score<10){
        user = 2;
      }
      else if(score>10 && score<=20){
        user = 10;
      }
      else if(score>20 && score<=40){
        user = 40;
      }
      else if(score>40 && score<=60){
        user = 80;
      }
      else if(score>60 && score<=80){
        user = 92;
      }
      else if(score>80){
        user = 99;
      }
      $('#fenghao').removeClass('geili yinhen').addClass('geili');
      $('#scorecontent').html('您在<span id="stime" class="lighttext">2378</span>秒内抢到了<span id="sscore" class="lighttext">21341</span>个月饼<br>超过了<span id="suser" class="lighttext">31%</span>的用户！');
      $('#stime').text(time);
      $('#sscore').text(score);
      $('#suser').text(user+'%');
      $('.btn1').text('请小伙伴吃月饼').removeClass('playagain').addClass('share');
    },
    run: function (ctx) {
      $('.score-wrap').show();
      ctx.clearRect(0, 0, this.bgWidth, this.bgHeight);  //清空给定矩形内的指定像素
      this.rollBg(ctx);
      this.timmer = setTimeout(function () {
        gameMonitor.run(ctx);
      }, Math.round(1000 / 60));
      //绘制飞船
      this.ship.paint();
      this.ship.eat(this.moonList);
      //产生月饼
      this.genorateMoon();
      //绘制月饼
      for (var i = this.moonList.length - 1; i >= 0; i--) {
        var moon = this.moonList[i];
        if (moon) {
          moon.paint(ctx);
          moon.move(ctx);
        }
      }
      this.time++;
    },
    isMobile: function () {
      var sUserAgent= navigator.userAgent.toLowerCase(),
      bIsIpad= sUserAgent.match(/ipad/i) == "ipad",
      bIsIphoneOs= sUserAgent.match(/iphone os/i) == "iphone os",
      bIsMidp= sUserAgent.match(/midp/i) == "midp",
      bIsUc7= sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4",
      bIsUc= sUserAgent.match(/ucweb/i) == "ucweb",
      bIsAndroid= sUserAgent.match(/android/i) == "android",
      bIsCE= sUserAgent.match(/windows ce/i) == "windows ce",
      bIsWM= sUserAgent.match(/windows mobile/i) == "windows mobile",
      bIsWebview = sUserAgent.match(/webview/i) == "webview";
      return (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM);
    }
  }
  // 简易的图片加载器
  function ImageMonitor () {
    var imgArr = [];
    return {
      createImage: function (src) {
        return typeof imgArr[src] != 'undefined' ? imgArr[src] : (imgArr[src] = new Image(), imgArr[src].src = src, imgArr[src]);
      },
      loadImage: function (arr, callback) {
        for (var i = 0, len = arr.length; i < len; i++) {
          var img = arr[i];
          imgArr[img] = new Image();
          imgArr[img].onload = function () {
            if (i == len - 1 && typeof callback == 'function') {
              callback();
            }
          }
          imgArr[img].src = img;
        }
      }
    }
  }
  function Moon (type, left, id) {
    this.speedUpTime = 300;
    this.width = this.height = 50;
    this.top = - this.height;
    this.type = type;
    this.left = left;
    this.id = id;
    this.speed = 0.04 * Math.pow(1.2, Math.floor(gameMonitor.time / this.speedUpTime))
    this.loop = 0;
    var p = type == 0 ? 'imgs/food1.png' : 'imgs/food2.png';
    this.pic = gameMonitor.im.createImage(p);
    this.paint = function (ctx) {
      ctx.drawImage(this.pic, left, this.top, this.width, this.height);
    };
    this.move = function (ctx) {
      if (gameMonitor.time % this.speedUpTime == 0) {
        this.speed *= 1.2;
      }
      this.top += ++this.loop * this.speed;
      if (this.top > gameMonitor.screenHeight) {
        gameMonitor.moonList[this.id] = null;
      } else {
        this.paint(ctx);
      }
    }
  }
  // 实现飞船的绘制、操控
  function Ship (ctx) {
    gameMonitor.im.loadImage(['imgs/player.png']);
    this.player = gameMonitor.im.createImage('imgs/player.png');
    this.width = this.height = 80;
    this.left = (gameMonitor.screenWidth - this.width) / 2;
    this.top = gameMonitor.screenHeight - 2 * this.height;
    this.paint = function () {
      ctx.drawImage(this.player, this.left, this.top, this.width, this.height);  //在画布上定位图像，并规定图像的宽度和高度
    }
    this.controll = function () {
      var _this = this,
          stage = $('#gamePanel'),
          move = false;
      stage.on(gameMonitor.eventType.start, function (event) {
        _this.setPosition(event);
        move = true;
      }).on(gameMonitor.eventType.end, function () {
        move = false;
      }).on(gameMonitor.eventType.move, function (event) {
        event.preventDefault();
        if (move) {
          _this.setPosition(event);
        }
      });
    }
    this.setPosition = function (event) {
      if (gameMonitor.isMobile()) {
        var tarLeft = event.changedTouches[0].clientX,
            tarTop = event.changedTouches[0].clientY;
      } else {
        var tarLeft = event.offsetX,
            tarTop = event.offsetY;
      }
      this.left = tarLeft - this.width / 2;
      this.top = tarTop - this.height / 2;
      if (this.left < 0) {
        this.left = 0;
      } else if (this.left > gameMonitor.screenWidth - this.width) {
        this.left = gameMonitor.screenWidth - this.width;
      }
      if (this.top < 0) {
        this.top = 0;
      } else if (this.top > gameMonitor.screenHeight - this.height) {
        this.top = gameMonitor.screenHeight - this.height;
      }
      this.paint();
    }
    this.eat = function (moonList) {
      for (var i = moonList.length - 1; i >= 0; i--) {
        var moon = moonList[i];
        if (moon) {
          var l1 = this.top + this.height / 2 - (moon.top + moon.height / 2);
          var l2 = this.left + this.width / 2 - (moon.left + moon.width / 2);
          var l3 = Math.sqrt(l1 * l1 + l2 * l2);
          if (l3 <= this.height / 2 + moon.height / 2) {
            moonList[moon.id] = null;
            if (moon.type == 0) {
              gameMonitor.stop();
              $('#gameoverPanel').show();
              setTimeout(function () {
                $('#gameoverPanel').hide();
                $('#resultPanel').show();
                gameMonitor.getScore();
              }, 2000);
            } else {
              $('#score').text(++gameMonitor.score);
              $('.heart').removeClass('hearthot').addClass('hearthot');
              setTimeout(function () {
                $('.heart').removeClass('hearthot');
              }, 200);
            }
          }
        }
      }
    }
  }
  gameMonitor.init();
});