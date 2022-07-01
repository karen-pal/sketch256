import {Composite } from "matter-js";
import { Func } from '../core/func';
import { Canvas } from '../webgl/canvas';
import { Object3D } from 'three/src/core/Object3D';
import { Conf } from '../core/conf';
import { MeshBasicMaterial } from "three/src/materials/MeshBasicMaterial";
import { Mesh } from 'three/src/objects/Mesh';
import { Color } from 'three/src/math/Color';
import { Param } from "../core/param";
import { PlaneGeometry } from 'three/src/geometries/PlaneGeometry';
import { BufferAttribute } from 'three/src/core/BufferAttribute';
import { TexLoader } from "../webgl/texLoader";
import { Texture } from 'three/src/textures/Texture';
import { VideoTexture } from 'three/src/textures/VideoTexture';
export class Visual extends Canvas {

  private _con: Object3D;
  private _mesh:Mesh;
  private _geo:PlaneGeometry;

  constructor(opt: any) {
    super(opt);

    this._con = new Object3D()
    this.mainScene.add(this._con)

    this._geo = new PlaneGeometry(1, 1, Conf.instance.COLUMNS - 1, Conf.instance.ROWS - 1)
    //webcam code
    this.video = document.getElementById('video');
    var constraints = { video: { width: this.renderSize.width, height: this.renderSize.height } }
    var texture = new VideoTexture(video);
    //this.render.canvas.fillStyle = '#FFFFFF'

    //const webcamTexture = new Texture(webcamCanvas)



    //webcam code
    this._mesh = new Mesh(
      this._geo,
      new MeshBasicMaterial({
        transparent:true,
        map: texture//Conf.instance.PATH_IMG + 'tex-sample.png')
      })
    );
    this._con.add(this._mesh);
    //console.log(this._mesh);
    this._resize()
  }


  public updatePos(stack:Composite): void {
    const offsetX = -this.renderSize.width * 0.5
    const offsetY = this.renderSize.height * 0.5

    const num = this._mesh.geometry.attributes.position.count
    const arr = new Float32Array(num * 3)

    stack.bodies.forEach((val,i) => {
      const key = i * 3;
      const bodyPos = val.position;
      arr[key + 0] = bodyPos.x + offsetX
      arr[key + 1] = bodyPos.y * -1 + offsetY
      arr[key + 2] = 0;
    })

    this._mesh.geometry.setAttribute('position', new BufferAttribute(arr, 3));
  }


  protected _update(): void {
    super._update()

    if (this.isNowRenderFrame()) {
      this._render()
    }
  }


  private _render(): void {
    const bgColor = new Color(Param.instance.main.bg.value)
    this.renderer.setClearColor(bgColor, 1)
    this.renderer.render(this.mainScene, this.camera)
  }


  public isNowRenderFrame(): boolean {
    return this.isRender
  }


  _resize(isRender: boolean = true): void {
    super._resize();

    const w = Func.instance.sw();
    const h = Func.instance.sh();

    this.renderSize.width = w;
    this.renderSize.height = h;

    this.updateCamera(this.camera, w, h);

    let pixelRatio: number = window.devicePixelRatio || 1;

    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(w, h);
    this.renderer.clear();

    if (isRender) {
      this._render();
    }
  }

}
