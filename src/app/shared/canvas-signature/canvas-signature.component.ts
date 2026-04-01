import { Component, Input, Output, EventEmitter, ViewChild, OnInit, HostListener, ElementRef } from '@angular/core';

@Component({
  selector: 'app-canvas-signature',
  templateUrl: './canvas-signature.component.html',
  styleUrls: ['./canvas-signature.component.css']
})
export class CanvasSignatureComponent implements OnInit {
  @Input() width = 300;
  @Input() height = 150;
  @Output() signatureSaved = new EventEmitter<string>();

  @ViewChild('sigPad', { static: true }) sigPad!: ElementRef<HTMLCanvasElement>;

  private context!: CanvasRenderingContext2D | null;
  private isDrawing = false;
  img: string | null = null;

  ngOnInit() {
    const canvas = this.sigPad.nativeElement;
    canvas.width = this.width;
    canvas.height = this.height;

    this.context = canvas.getContext('2d');
    if (this.context) {
      this.context.strokeStyle = '#3742fa';
      this.context.lineWidth = 2;
      this.context.lineCap = 'round';
    }
  }

  @HostListener('document:mouseup', ['$event'])
  @HostListener('document:touchend', ['$event'])
  onMouseUp() {
    this.isDrawing = false;
  }

  onMouseDown(e: MouseEvent | TouchEvent) {
    this.isDrawing = true;
    const coords = this.relativeCoords(e);
    if (this.context) {
      this.context.beginPath();
      this.context.moveTo(coords.x, coords.y);
    }
  }

  onMouseMove(e: MouseEvent | TouchEvent) {
    if (this.isDrawing && this.context) {
      e.preventDefault(); // Prevent scrolling on touch
      const coords = this.relativeCoords(e);
      this.context.lineTo(coords.x, coords.y);
      this.context.stroke();
    }
  }

  private relativeCoords(event: MouseEvent | TouchEvent) {
    const canvas = this.sigPad.nativeElement;
    const bounds = canvas.getBoundingClientRect();
    let clientX, clientY;

    if (event instanceof MouseEvent) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    }

    const x = clientX - bounds.left;
    const y = clientY - bounds.top;
    return { x: x, y: y };
  }

  clear() {
    if (this.context) {
      this.context.clearRect(0, 0, this.width, this.height);
      this.context.beginPath();
    }
    this.img = null;
    this.signatureSaved.emit('');
  }

  save() {
    this.img = this.sigPad.nativeElement.toDataURL("image/png");
    this.signatureSaved.emit(this.img);
  }
}
