import { AfterViewInit, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import * as widgetAPI from "./widgetAPI";

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
    widgetAPI.onReceiveWidgetMessage(this.renderer,this.SC);
    widgetAPI.widgetConstructor(this.scFrame,"widget1",this.SC);
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

// TO DO : after changing the src of the widget, binded events stop working

}
