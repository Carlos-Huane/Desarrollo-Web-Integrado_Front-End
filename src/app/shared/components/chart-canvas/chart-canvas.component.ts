import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  effect,
  input
} from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-chart-canvas',
  standalone: true,
  template: `<div class="wrap"><canvas #cv></canvas></div>`,
  styles: [`
    .wrap { position: relative; width: 100%; height: 100%; min-height: 220px; }
    canvas { max-width: 100%; }
  `]
})
export class ChartCanvasComponent implements AfterViewInit, OnDestroy {
  @ViewChild('cv', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  readonly config = input.required<ChartConfiguration>();

  private chart: Chart | null = null;

  constructor() {
    effect(() => {
      const cfg = this.config();
      if (this.chart && cfg) {
        this.chart.data = cfg.data;
        if (cfg.options) this.chart.options = cfg.options;
        this.chart.update();
      }
    });
  }

  ngAfterViewInit(): void {
    this.chart = new Chart(this.canvasRef.nativeElement, this.config());
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}
