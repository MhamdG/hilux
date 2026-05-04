import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface MultiLang {
  ar?: string;
  en?: string;
}

interface ServiceItem {
  serviceID: number;
  serviceSlug: string;
  ar?: string;
  en?: string;
  icon?: string;
}

interface ServiceCategory {
  serviceCategorySlug: string;
  serviceCategoryName?: MultiLang;
  services?: ServiceItem[];
}

@Component({
  selector: 'app-services-directory',
  templateUrl: './services-directory.component.html',
  styleUrls: ['./services-directory.component.css']
})
export class ServicesDirectoryComponent implements OnInit {
  language: string = 'ar';
  isRTL: boolean = true;
  categories: ServiceCategory[] = [];
  isLoading: boolean = false;
  error: string = '';
  searchQuery: string = '';
  activeCategory: string = 'all';
  totalServices: number = 0;

  readonly API_URL = 'http://wfe.ajre.gov.test/AjmanLandProperty/index.php/serviceCategories/publicapi/servicesCategories';

  constructor(private router: Router) {
    this.isRTL = this.language === 'ar';
  }

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.isLoading = true;
    this.error = '';

    fetch(this.API_URL)
      .then(res => res.json())
      .then(data => {
        const raw = Array.isArray(data) ? data : Object.values(data);
        const cats: ServiceCategory[] = (raw as ServiceCategory[]).map(c => ({
          ...c,
          services: c.services
            ? (Array.isArray(c.services) ? c.services : Object.values(c.services))
            : [],
        }));
        this.categories = cats.filter(c => c.serviceCategorySlug !== 'root');
        this.updateTotalServices();
        this.isLoading = false;
      })
      .catch(() => {
        this.error = this.isRTL ? 'تعذر تحميل الخدمات. حاول مرة أخرى.' : 'Failed to load services. Please try again.';
        this.isLoading = false;
      });
  }

  updateTotalServices() {
    this.totalServices = this.categories.reduce((sum, cat) => sum + (cat.services?.length || 0), 0);
  }

  getText(obj: MultiLang | undefined): string {
    if (!obj) return '';
    return (this.language === 'ar' ? obj.ar : obj.en) || obj.ar || obj.en || '';
  }

  getServiceTitle(s: ServiceItem): string {
    return (this.language === 'ar' ? s.ar : s.en) || s.ar || s.en || '';
  }

  setActiveCategory(slug: string) {
    this.activeCategory = slug;
  }

  get filteredItems(): { service: ServiceItem; catSlug: string }[] {
    const query = this.searchQuery.toLowerCase().trim();
    const items: { service: ServiceItem; catSlug: string }[] = [];

    for (const cat of this.categories) {
      if (this.activeCategory !== 'all' && cat.serviceCategorySlug !== this.activeCategory) continue;
      for (const s of cat.services || []) {
        const title = this.getServiceTitle(s).toLowerCase();
        if (query && !title.includes(query)) continue;
        items.push({ service: s, catSlug: cat.serviceCategorySlug });
      }
    }
    return items;
  }

  navigateToService(service: ServiceItem) {
    this.router.navigate(['/service-details', service.serviceID], { queryParams: { slug: service.serviceSlug } });
  }
}
