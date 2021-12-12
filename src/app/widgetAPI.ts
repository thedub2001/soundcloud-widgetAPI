import { ElementRef, Renderer2 } from "@angular/core";

export var widgetFunctions = ["play", "pause", "toggle", "seekTo", "setVolume", "next", "prev", "skip"];
export var widgetGetters = ["getVolume", "getDuration", "getPosition", "getSounds", "getCurrentSound", "getCurrentSoundIndex", "isPaused"];
export var widgetEvents = ["loadProgress", "playProgress", "play", "pause", "finish", "seek", "ready", "sharePanelOpened", "downloadClicked", "buyClicked", "error",];


export function onReceiveWidgetMessage(ren:Renderer2,SC:{}) {
    ren.listen('window', 'message', (event) => {
      
      if (event.origin !== 'https://w.soundcloud.com') { // Warning : event.origin can change with SoundCloud updates
      // console.log('data received from iframe with origin :', event.origin)
      return;
    }
    else {
        const widgetData = JSON.parse(event.data);
        // console.log('data received from trusted source :', widgetData);

          for (const property in SC) {
            if (event.source===SC[property].source()) {
               // console.log("message received from widget named :",property)
              for (const p of widgetGetters) {
                  if (p==widgetData.method) {
                    SC[property][widgetData.method].result=widgetData.value;

                    return
                  }
              }
              if (widgetData.value==null) SC[property].event[widgetData.method].result=Date.now();
              else SC[property].event[widgetData.method].result=widgetData.value;
              return
            }
          }
      
      }
    });
  }

export function widgetConstructor(elRef : ElementRef,n : string, SC : {}) {
    
    SC[n]= {};
    SC[n].event = {};
    SC[n].source = () => {return elRef.nativeElement.contentWindow};
    SC[n].load = (url : string) => {elRef.nativeElement.src = "https://w.soundcloud.com/player/?url=https://" + url + "&amp;auto_play=true"};

    widgetFunctions.forEach(e => {
      SC[n][e] = (v : number) => {
        if (v) 
        elRef.nativeElement.contentWindow.postMessage('{"method":"' + e + '","value":' + v + '}', "https://w.soundcloud.com/player/");
        else 
        elRef.nativeElement.contentWindow.postMessage('{"method":"' + e + '"}', "https://w.soundcloud.com/player/");
      }
    });

    widgetGetters.forEach(e => {
      SC[n][e] = () => {
        elRef.nativeElement.contentWindow.postMessage('{"method":"' + e + '","value":null}', "https://w.soundcloud.com/player/");
      }
      SC[n][e]["value"]="";
      Object.defineProperty(SC[n][e], "result", {set: function (v) {this.value=v;this.bind(v);}});
      SC[n][e]["bind"]=function () {};
      SC[n][e]["unbind"]=function (v: any) {this.bind=function () {};};


    });

    widgetEvents.forEach(e => {
      SC[n].event[e] = (b : boolean) => {
        if (b)
          elRef.nativeElement.contentWindow.postMessage('{"method":"addEventListener","value":"' + e + '"}', "https://w.soundcloud.com/player/");
        else
          elRef.nativeElement.contentWindow.postMessage('{"method":"removeEventListener","value":"' + e + '"}', "https://w.soundcloud.com/player/");
      }
      SC[n].event[e]["value"]="";
      SC[n].event[e]["value"]="";
      Object.defineProperty(SC[n].event[e], "result", {set: function (v) {this.value=v;this.bind(v);}});
      SC[n].event[e]["bind"]=function () {};
      SC[n].event[e]["unbind"]=function (v: any) {this.bind=function () {};};
    });
  }