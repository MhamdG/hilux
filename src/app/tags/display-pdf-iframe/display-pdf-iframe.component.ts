import { Component, OnInit, Input } from '@angular/core';
import { FieldsService } from '../../shared/fields.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-display-pdf-iframe',
  templateUrl: './display-pdf-iframe.component.html',
  styleUrls: ['./display-pdf-iframe.component.css']
})
export class DisplayPdfIframeComponent implements OnInit {

  @Input() data: any;

  safeUrl: SafeResourceUrl | undefined;

  constructor(private service: FieldsService, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    if (this.data && this.data.src) {
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.data.src);
    }
  }

  getClass(classname: string, data: any) {
    return classname + this.service.getFieldWidth(data.displayWidth)
  }
}
