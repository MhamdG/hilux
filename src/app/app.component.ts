import { Component, OnInit, HostListener, Renderer2 } from '@angular/core';
import bsCustomFileInput from 'bs-custom-file-input';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'hilux';

  constructor(private renderer: Renderer2) {}

  ngOnInit() {
    bsCustomFileInput.init();
    this.checkSidebar();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkSidebar();
  }

  private checkSidebar() {
    if (window.innerWidth < 992) {
      this.renderer.addClass(document.body, 'sidebar-collapse');
      this.renderer.removeClass(document.body, 'sidebar-open');
    } else {
      this.renderer.removeClass(document.body, 'sidebar-collapse');
    }
  }
}
