/*
 * js-touch.js
 *
 * Copyright (c) 2021 tora-japan (s.noda)
 *
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 *
 * https://github.com/tora-japan/
 */


/*
サンプルメモ、今はドキュメントにはしていない。

touchController = new TouchController();
uiPos = [
  { x: 25 * 3 - 12, y: 25 * 5 * 2 ,name : 'up'},
  { x: 25 * 3 - 12, y: 0 ,name : 'down'},
  { x: 25 * 0, y: 25 * 5 ,name : 'left'},
  { x: 25 * 5, y: 25 * 5 ,name : 'right'},
  { x: 325, y: 800-125-200-(25*6)*0 ,name : 'rot1'},
  { x: 325, y: 800-125-200-(25*6)*1 ,name : 'rot2'},
  { x: 325, y: 800-125-200-(25*6)*2 ,name : 'rot3'},
  { x: 325, y: 800-125-200-(25*6)*3 ,name : 'rot4'},
];
touchController.addTouchObject('screen', 0, 0, 450, 800);
touchController.touchObjectList[0].enable=0;

for (i = 0; i < uiPos.length; i++) {
  touchController.addTouchObject(
    uiPos[i].name,
    uiPos[i].x, uiPos[i].y,125,125
  );
}

更新ループの箇所
touchController.update();

if( touchController.touchObjectList[0].getClick() )
{
  consol.log(touchController.touchObjectList[0].name + "をクリック");
}

if( touchController.getClick('left') )
{
  console.log('leftをクリック');
}

if( touchController.getPress('left') )
{
  console.log('left');
}
if( touchController.getPress('right') )
{
  console.log('left');
}

*/


// タッチオブジェクト
class TouchObject
{
  constructor(){
    this.id=0;        // id
    this.name="";     // 名前
    this.enable=1;
    this.x1=0;        // 範囲
    this.y1=0;        // 範囲
    this.x2=0;        // 範囲
    this.y2=0;        // 範囲
    this.touch=0;
    this.click=0;     // クリック状態
    this.down=0;      // 押す・放すの状態
    this.repeat=0;    // 繰り返し
    this.time=0;      // 時間(ミリ秒)
  }
  isHit(px,py)
  {
    if(this.enable==0) return 0;
    if((this.x1 <= px) && (px < this.x2) && (this.y1 <= py) && (py < this.y2)) return 1;
    return 0;
  }


  // click判定(一度だけ判定)
  getClick()
  {
    if(this.click)
    {
      this.click=0;       // 自動でクリック状態を消す
      return 1;
    }
    return 0;
  }
  // リピート数を返す
  getRepeat()
  {
    return this.repeat;
  }
  // 押しっぱなし判定(一度だけ判定)
  getLongPress(value)
  {
    if(this.usedTime==0)
    if(this.down)
    {
      if( this.time + value  <= new Date().getTime())
      {
        this.usedTime=1;  // 時間判定用：使用済を立てる
        return 1;
      }
    }
    return 0;
  }

  // 押しっぱなし判定(一定時間を繰り返し、 長押ししたら判定)
  getLoopPress(value)
  {
    if(this.down)
    {
      if( this.time + value  <= new Date().getTime())
      {
        this.time = new Date().getTime();
        return 1;
      }
    }
    return 0;
  }
  // 押しっぱなし判定(クリック判定をする, 長押ししたら判定)
  getPress(value)
  {
    if(this.getClick()) return 1;
    if(this.getLoopPress(value)) return 1;
    return 0;
  }
};


class Finger
{
  constructor(){
    this.id = 0;                        // id
    this.enable = 0;                    // リソース
    this.touchObject = null;            // 指が指しているタッチオブジェクト
  }
};

class TouchController
{
  constructor(){
    this.touchObjectAutoIndent = 0;     // 自動インデント
    this.touchObjectList=[];            // タッチオブジェクトリスト
    this.fingerList = [];               // 指リスト
    for(var i=0;i<10;i++) this.fingerList.push(new Finger());
  }

  // 指リストから、空いている指の配列番号を得る
  findFinger()
  {
    for (var i = 0; i < 10; i++) {
      if (this.fingerList[i].enable==0) return i;
    }
    return -1;
  }
  // 指リストから、一致する指の配列番号を得る
  findFingerId(id)
  {
    for (var i = 0; i < 10; i++) {
      if (this.fingerList[i].enable == 0) continue;
      if (this.fingerList[i].id == id) return i;
    }
    return -1;
  }

  // タッチオブジェクトリストに追加する
  addTouchObject(name,x1,y1,width,height)
  {
    let obj;
    obj = new TouchObject();
    obj.name = name;
    obj.x1 = x1;
    obj.y1 = y1;
    obj.x2 = x1+width;
    obj.y2 = y1+height;
    obj.id = this.touchObjectAutoIndent;
    this.touchObjectList.push(obj);
    this.touchObjectAutoIndent++;
    return obj.id;
  }

  // タッチオブジェクトリストからIDを探し、配列番号を返す
  findtouchObjectListId(id)
  {
    for (let i = 0, iMax = this.touchObjectList.length; i < iMax; i++) {
      if (this.touchObjectList[i].enable == 0) continue;    // 無効であれば次へ
      if (this.touchObjectList[i].id == id) return i;       // idが一致？
    }
    return -1;
  }
  // タッチオブジェクトリストから名前を探し、配列番号を返す
  findtouchObjectListName(name)
  {
    for (let i = 0, iMax = this.touchObjectList.length; i < iMax; i++) {
      if (this.touchObjectList[i].enable == 0) continue;    // 無効であれば次へ
      if (this.touchObjectList[i].name == name) return i;   // 名前が一致？
    }
    return -1;
  }
  // タッチオブジェクトリストからＩＤを消す
  removetouchObjectListId(id)
  {
    let index = this.findtouchObjectListId(id);
    if(index!=-1) this.touchObjectList.splice(index,1);
  }
  // タッチオブジェクトリストから名前と一致するオブジェクトを消す
  removetouchObjectListName(name)
  {
    let index = this.findName(name);
    if(index!=-1) this.touchObjectList.splice(index,1);
  }

  // 走査してヒットしたオブジェクトを返す
  findHitObject(x,y)
  {
    for(let i=0,iMax=this.touchObjectList.length;i<iMax;i++)
    {
      if(this.touchObjectList[i].isHit(x,y)) return this.touchObjectList[i];
    }
    return null;
  }

  begin(touches) {
    for (var i = 0; i < touches.length; i++) {
      var fingerID = this.findFinger();                       // 空いている指を探す
      if (fingerID == -1) continue;
      this.fingerList[fingerID].enable = 1;                   // 有効にする
      this.fingerList[fingerID].id = touches[i].getID();      // タッチIDを保存

      // タッチした位置にヒットするタッチオブジェクトを探す
      var x = Math.floor(touches[i].getLocationX());
      var y = Math.floor(touches[i].getLocationY());
      var obj = this.findHitObject(x, y);
      if (obj != null) {
        this.fingerList[fingerID].touchObject = obj;          // タッチオブジェクトを保存
        obj.touch = 1;                                        // タッチ状態にする
      }
    }
  }

  move(touches) {
    for (var i = 0; i < touches.length; i++) {
      var fingerID = this.findFingerId(touches[i].getID());   // idを探す
      if (fingerID == -1) continue;
      var obj = this.fingerList[fingerID].touchObject;        // 指が指しているタッチオブジェクト
      if (obj != null) {
        var x = Math.floor(touches[i].getLocationX());
        var y = Math.floor(touches[i].getLocationY());
        // 範囲外か？
        if (obj.isHit(x, y) == 0) {
          // キャンセル
          this.fingerList[fingerID].touchObject = null;
          obj.touch = 0;
        }
      }
    }
  }

  end(touches) {
    for (var i = 0; i < touches.length; i++) {
      var fingerID = this.findFingerId(touches[i].getID());     // idを探す
      if (fingerID == -1) continue;

      var obj = this.fingerList[fingerID].touchObject;          // 指が示す　タッチオブジェクトを得る
      if (obj != null) {
          // キャンセル
          this.fingerList[fingerID].touchObject = null;
          obj.touch = 0;
      }
      this.fingerList[fingerID].enable = 0;
      this.fingerList[fingerID].id = -1;

    }
  }

  update()
  {
    let i,obj;
    for(i=0;i<this.touchObjectList.length;i++)
    {
      obj = this.touchObjectList[i];
      if(obj.touch)
      {
        // 最初に押されていた場合、開始時間を記録する
        if(obj.down==0)
        {
          // UNIXタイムスタンプを取得する (ミリ秒単位)
          obj.time=new Date().getTime();
          obj.usedTime=0;
          obj.click=1;   // クリックフラグ
        }
        obj.down=1;    // 押されたフラグ
        // リピートのカウント 9999で上限を設ける
        if(++obj.repeat>=Number.MAX_VALUE-1)
        {
          obj.repeat=Number.MAX_VALUE-1;
        }
      }else{
        obj.usedTime=0;
        obj.down=0;    // 放された
        obj.repeat=0;  // リピートを初期化
      }
    }
  }


  getClick(name)
  {
    var i = this.findtouchObjectListName(name);
    return this.touchObjectList[i].getClick();
  }
  // リピート数を返す
  getRepeat(name)
  {
    var i = this.findtouchObjectListName(name);
    return this.touchObjectList[i].getRepeat();
  }
  // 押しっぱなし判定(一度だけ判定)
  getLongPress(name,value)
  {
    var i = this.findtouchObjectListName(name);
    return this.touchObjectList[i].getLongPress(value);
  }
  // 押しっぱなし判定(一定時間を繰り返し、 長押ししたら判定)
  getLoopPress(name,value)
  {
    var i = this.findtouchObjectListName(name);
    return this.touchObjectList[i].getLoopPress(value);
  }
  // 押しっぱなし判定(クリック判定をする, 長押ししたら判定)
  getPress(name,value)
  {
    var i = this.findtouchObjectListName(name);
    return this.touchObjectList[i].getPress(value);
  }

};
