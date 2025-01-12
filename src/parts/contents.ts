
import { Bodies, Body, Composite, Composites, Engine, Events, Render, Runner, Common } from "matter-js";
import { Conf } from "../core/conf";
import { Func } from "../core/func";
import { Mouse } from "../core/mouse";
import { MyDisplay } from "../core/myDisplay";
import { Visual } from "./visual";

// -----------------------------------------
//
// -----------------------------------------
export class Contents extends MyDisplay {

  public engine:Engine;
  public render:Render;

  // マウス用
  private _mouse:Body;

  private _stack:Composite;

  // ビジュアル用
  private _v:Visual;

  constructor(opt:any) {
    super(opt)

    const sw = Func.instance.sw();
    const sh = Func.instance.sh();

    // エンジン
    this.engine = Engine.create();

    // 重力方向変える
    this.engine.gravity.x = 0;
    this.engine.gravity.y = 0;

    // レンダラー
    this.render = Render.create({
      element: document.body,
      engine: this.engine,
      options: {
        width: sw,
        height: sh,
        showAngleIndicator: false,
        showCollisions: false,
        showVelocity: false,
        pixelRatio:0.1
      }
    });
    this.render.canvas.classList.add('matter')

    // 布Body
    const group = Body.nextGroup(true);

    let particleOptions:any = {};
    particleOptions = Common.extend({ inertia: Infinity, friction: 0.00001, collisionFilter: { group: group }, render: { visible: false }}, particleOptions);

    let constraintOptions:any = {};
    constraintOptions = Common.extend({ stiffness: 0.1, render: { type: 'line', anchors: false, visible: false } }, constraintOptions);

    let columns = Conf.instance.COLUMNS;
    let rows = Conf.instance.ROWS;
    const areaW = sw * Func.instance.val(0.8, 0.5);
    const areaH = areaW;
    const w = (areaW / columns);
    const h = (areaH / rows);
    let cloth = Composites.stack((sw - areaW) * 0.5, (sh - areaH) * 0.5, columns, rows, 0, 0, function(x:any, y:any) {
        return Bodies.rectangle(x, y, w, h, particleOptions);
    });

    Composites.mesh(cloth, columns, rows, false, constraintOptions);

    // 上部分を固定
    for (let i = 0; i < columns; i++) {
      cloth.bodies[i].isStatic = true;
    }

    // 下部分を固定
    const len = cloth.bodies.length
    for (let i = len - columns; i < len; i++) {
      cloth.bodies[i].isStatic = true;
    }

    // 左右を固定
    for (let i = 0; i < rows; i++) {
      cloth.bodies[i * columns].isStatic = true;
      cloth.bodies[i * columns + (columns - 1)].isStatic = true;
    }

    Composite.add(this.engine.world, [
      cloth,
    ]);
    this._stack = cloth;

    // マウス
    const mouseSize =  Math.max(sw, sh) * 0.05
    this._mouse = Bodies.circle(0, 0, mouseSize, {isStatic:true, render:{visible:false}});
    Composite.add(this.engine.world, [
      this._mouse,
    ]);
    Body.setPosition(this._mouse, {x:9999, y:9999});
    //webcam




    //webcam

    // ビジュアル
    this._v = new Visual({
      el:this.getEl()
    })
    console.log(this._v.video.srcObject);
    var constraints = {
      video: {
        width: 1280,
        height: 720,
        facingMode: 'user'
      }
    };
    function initWebcam(v){
    navigator.mediaDevices
        .getUserMedia(constraints)
        .then(function (mediaStream) {
            console.log(v)
            v.video.srcObject = mediaStream
            v.video.play()
        }
        )
        .catch(function (err) {
            alert(err.name + ': ' + err.message)
        })}
    initWebcam(this._v);
    // run the renderer
    Render.run(this.render);

    // create runner
    const runner:Runner = Runner.create();

    // run the engine
    Runner.run(runner, this.engine);

    // 描画後イベント
    Events.on(this.render, 'afterRender', () => {
      this._eAfterRender();
    })

    this._resize();
  }


  private _eAfterRender(): void {
    // ビジュアル更新
    this._v.updatePos(this._stack);
  }



  protected _update(): void {
    super._update();

    let mx = Mouse.instance.x
    let my = Mouse.instance.y

    if(Conf.instance.USE_TOUCH && Mouse.instance.isDown == false) {
      mx = 9999
      my = 9999
    }

    // マウス位置に合わせる
    Body.setPosition(this._mouse, {x:mx, y:my});
  }


  protected _resize(): void {
    super._resize();

    const sw = Func.instance.sw();
    const sh = Func.instance.sh();

    this.render.canvas.width = sw;
    this.render.canvas.height = sh;
  }
}
