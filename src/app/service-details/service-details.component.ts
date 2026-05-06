import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../environments/environment';

interface TabRow {
  title?: string;
  data?: string[];
  options?: { titleType?: string; dataType?: string };
}

interface TabConfig {
  key: string;
  title: string;
  icon: string;
  rows: TabRow[];
  applyLink?: string;
}

@Component({
  selector: 'app-service-details',
  templateUrl: './service-details.component.html',
  styleUrls: ['./service-details.component.css']
})
export class ServiceDetailsComponent implements OnInit {
  language: string = 'ar';
  isRTL: boolean = true;
  serviceId: string | null = null;
  data: Record<string, unknown> | null = null;
  title: string = '';
  description: string = '';
  isLoading: boolean = false;
  error: string = '';
  activeTab: number = 0;
  tabs: TabConfig[] = [];

  readonly API_BASE_URL = `${environment.apiHost}/AjmanLandProperty/index.php/serviceCategories/publicapi/services`;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.isRTL = this.language === 'ar';
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.serviceId = params['id'];
      if (this.serviceId) {
        this.loadDetails(this.serviceId);
      }
    });
  }

  loadDetails(serviceId: string) {
    this.isLoading = true;
    this.error = '';

    fetch(`${this.API_BASE_URL}/${serviceId}`)
      .then(res => res.json())
      .then(json => {
        if (!json?.data) throw new Error('No data');
        this.data = json.data as Record<string, unknown>;
        this.title = this.langField('title');
        this.description = this.langField('description');
        this.initializeTabs();
        this.isLoading = false;
      })
      .catch(() => {
        this.error = this.isRTL ? 'لا توجد خدمة مطابقة.' : 'Service not found.';
        this.isLoading = false;
      });
  }

  langField(base: string): string {
    if (!this.data) return '';
    const key = `${base}_${this.language}`;
    return (this.data[key] as string) || '';
  }

  langArray(base: string): TabRow[] {
    if (!this.data) return [];
    const key = `${base}_${this.language}`;
    const val = this.data[key];
    if (!val) return [];
    if (Array.isArray(val)) return val as TabRow[];
    if (typeof val === 'object') return Object.values(val) as TabRow[];
    return [];
  }

  initializeTabs() {
    const fileIcon = '<svg class="icon-tab" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 012-2h6a1 1 0 00-.707.293l-5 5a1 1 0 00-.293.707v6.414a2 2 0 01-2-2V4z"></path><path fill-rule="evenodd" d="M8 12a1 1 0 100 2h8a1 1 0 100-2H8z" clip-rule="evenodd"></path></svg>';
    const checkIcon = '<svg class="icon-tab" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>';
    const coinsIcon = '<svg class="icon-tab" fill="currentColor" viewBox="0 0 20 20"><path d="M8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"></path><path fill-rule="evenodd" d="M17 4.5A2.5 2.5 0 0014.5 2h-5A2.5 2.5 0 007 4.5v2.006H4.5A2.5 2.5 0 002 9v6a2.5 2.5 0 002.5 2.5h5A2.5 2.5 0 0012 15v-2.006h2.5A2.5 2.5 0 0017 10.5v-6z" clip-rule="evenodd"></path></svg>';
    const clockIcon = '<svg class="icon-tab" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clip-rule="evenodd"></path></svg>';
    const globeIcon = '<svg class="icon-tab" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 00-.82-1.555 9 9 0 018.627 11.11 1 1 0 00-.996 1.045A3 3 0 0113 18H6a3 3 0 01-3-3V6z" clip-rule="evenodd"></path></svg>';
    const externalIcon = '<svg class="icon-tab" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>';

    this.tabs = [
      {
        key: 'documents',
        title: this.isRTL ? 'المستندات المطلوبة' : 'Required Documents',
        icon: fileIcon,
        rows: this.langArray('documents'),
      },
      {
        key: 'procedures',
        title: this.isRTL ? 'خطوات الإجراء' : 'Procedures',
        icon: checkIcon,
        rows: this.langArray('steps'),
      },
      {
        key: 'fees',
        title: this.isRTL ? 'الرسوم' : 'Fees',
        icon: coinsIcon,
        rows: this.langArray('fee'),
      },
      {
        key: 'duration',
        title: this.isRTL ? 'المدة الزمنية' : 'Duration',
        icon: clockIcon,
        rows: this.langArray('service_time'),
      },
      {
        key: 'channels',
        title: this.isRTL ? 'قنوات تقديم الخدمة' : 'Channels',
        icon: globeIcon,
        rows: this.langArray('channels'),
      }
    ];
  }

  get currentTab(): TabConfig {
    return this.tabs[this.activeTab] || this.tabs[0];
  }

  goBack() {
    this.router.navigate(['/services']);
  }
}
