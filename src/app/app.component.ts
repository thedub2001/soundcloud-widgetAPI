import { AfterViewInit, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
 
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  
  title = 'soundcloud-widgetAPI';
  SC : any = {};
  viewIsReady = false ;
  widgetFunctions = ["play", "pause", "toggle", "seekTo", "setVolume", "next", "prev", "skip"];
  widgetGetters = ["getVolume", "getDuration", "getPosition", "getSounds", "getCurrentSound", "getCurrentSoundIndex", "isPaused"];
  widgetEvents = ["loadProgress", "playProgress", "play", "pause", "finish", "seek", "ready", "sharePanelOpened", "downloadClicked", "buyClicked", "error",];
  bindedGet : boolean =false;
  bindedEvent : boolean =false;

  @ViewChild("scFrame", { static: false }) scFrame!: ElementRef;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit() {
    this.onReceiveWidgetMessage();
    this.widgetConstructor(this.scFrame,"widget1");
    this.viewIsReady = true;

  }
  
  bindAlertTogetVolume() {
    this.SC.widget1.getVolume.bind=function(v : any) {alert("Volume :" + v)};
    this.bindedGet=true;
  }

  unbindAlertTogetVolume() {
    this.SC.widget1.getVolume.unbind();
    this.bindedGet=false;
  }
  
  bindAlertToPauseEvent() {
    this.SC.widget1.event.pause.bind=function(v : any) {alert("event :" + JSON.stringify(v))};
    this.bindedEvent=true;
  }

  unbindAlertToPauseEvent() {
    this.SC.widget1.event.pause.unbind();
    this.bindedEvent=false;
  }

  onReceiveWidgetMessage() {
    this.renderer.listen('window', 'message', (event) => {
      
      if (event.origin !== 'https://w.soundcloud.com') { // Warning : event.origin can change with SoundCloud updates
      // console.log('data received from iframe with origin :', event.origin)
      return;
    }
    else {
        const widgetData = JSON.parse(event.data);
        // console.log('data received from trusted source :', widgetData);

          for (const property in this.SC) {
            if (event.source===this.SC[property].source()) {
              // console.log("message received from widget named :",property)
              for (const p of this.widgetGetters) {
                  if (p==widgetData.method) {
                    this.SC[property][widgetData.method].result=widgetData.value;
                    return
                  }
              }
              if (widgetData.value==null) this.SC[property].event[widgetData.method].result=Date.now();
              else this.SC[property].event[widgetData.method].result=widgetData.value;
              return
            }
          }
      
      }
    });
  }

  widgetConstructor(elRef : ElementRef,n : string) {
    
    this.SC[n]= {};
    this.SC[n].event = {};
    this.SC[n].source = () => {return elRef.nativeElement.contentWindow};
    this.SC[n].load = (url : string) => {elRef.nativeElement.src = "https://w.soundcloud.com/player/?url=https://" + url + "&amp;auto_play=true"};

    this.widgetFunctions.forEach(e => {
      this.SC[n][e] = (v : number) => {
        if (v) 
        elRef.nativeElement.contentWindow.postMessage('{"method":"' + e + '","value":' + v + '}', "https://w.soundcloud.com/player/");
        else 
        elRef.nativeElement.contentWindow.postMessage('{"method":"' + e + '"}', "https://w.soundcloud.com/player/");
      }
    });

    this.widgetGetters.forEach(e => {
      this.SC[n][e] = () => {
        elRef.nativeElement.contentWindow.postMessage('{"method":"' + e + '","value":null}', "https://w.soundcloud.com/player/");
      }
      this.SC[n][e]["value"]="";
      Object.defineProperty(this.SC[n][e], "result", {set: function (v) {this.value=v;this.bind(v);}});
      this.SC[n][e]["bind"]=function () {};
      this.SC[n][e]["unbind"]=function (v: any) {this.bind=function () {};};


    });

    this.widgetEvents.forEach(e => {
      this.SC[n].event[e] = (b : boolean) => {
        if (b)
          elRef.nativeElement.contentWindow.postMessage('{"method":"addEventListener","value":"' + e + '"}', "https://w.soundcloud.com/player/");
        else
          elRef.nativeElement.contentWindow.postMessage('{"method":"removeEventListener","value":"' + e + '"}', "https://w.soundcloud.com/player/");
      }
      this.SC[n].event[e]["value"]="";
      this.SC[n].event[e]["value"]="";
      Object.defineProperty(this.SC[n].event[e], "result", {set: function (v) {this.value=v;this.bind(v);}});
      this.SC[n].event[e]["bind"]=function () {};
      this.SC[n].event[e]["unbind"]=function (v: any) {this.bind=function () {};};
    });
  }

}
