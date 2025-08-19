import { Component, OnInit ,HostListener } from '@angular/core';
import { ChartType, ChartOptions } from 'chart.js';
import { LookupsService } from '../shared/lookups.service';
// import { LookupsService } from '../../assets/ownershipLand/';
import { HttpParams } from '@angular/common/http';

interface StatCard {
  title: string;
  count: string;
  unit: string;
  logo: string;
  chartData: number[];
  chartLabels: string[];
  chartColors: string[];
}

@Component({
  selector: 'app-ownership-statistics',
  templateUrl: './ownership-statistics.component.html',
  styleUrls: ['./ownership-statistics.component.css'],
})
export class OwnershipStatisticsComponent implements OnInit {
  constructor(private lookupsService: LookupsService) { }

  /* Header + date filter */
  headerTitle = 'باقة تملك في عجمان';
  fromDate = '';
  toDate = '';

  /* Global chart config */
  chartType: ChartType = 'pie';
  chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    legend: { display: false },
    plugins: {
      tooltip: {
        callbacks: {
          label: ctx => `${ctx.label}: ${ctx.raw}%`,
        },
      },
    },
  };

  /* Three separate cards (no array, no loop) */

  colorsSewerage: string[] = [
    "#10451D", "#155D27", "#1A7431", "#20883A", "#25A244", "#2DC653", "#4AD66D",
    "#6EDE8A", "#92E6A7", "#87EDC5",
    "#10451D", "#155D27", "#1A7431", "#20883A", "#25A244", "#2DC653", "#4AD66D",
    "#6EDE8A", "#92E6A7", "#87EDC5",
    "#10451D", "#155D27", "#1A7431", "#20883A", "#25A244", "#2DC653", "#4AD66D",
    "#6EDE8A", "#92E6A7", "#87EDC5",
    "#10451D", "#155D27", "#1A7431", "#20883A", "#25A244", "#2DC653", "#4AD66D",
    "#6EDE8A", "#92E6A7", "#87EDC5",
    "#10451D", "#155D27", "#1A7431", "#20883A", "#25A244", "#2DC653", "#4AD66D",
    "#6EDE8A", "#92E6A7", "#87EDC5",
  ];
  colorsEtisalat: string[] = [
    "#641220", "#6E1423", "#6E1423", "#A11D33", "#A11D33", "#A11D33", "#A71E34",
    "#B21E35", "#BD1F36","#C71F37", "#DA1E37", "#E01E37", 
    "#641220", "#6E1423", "#6E1423", "#A11D33", "#A11D33", "#A11D33", "#A71E34",
    "#B21E35", "#BD1F36","#C71F37", "#DA1E37", "#E01E37", 
    "#641220", "#6E1423", "#6E1423", "#A11D33", "#A11D33", "#A11D33", "#A71E34",
    "#B21E35", "#BD1F36","#C71F37", "#DA1E37", "#E01E37", 
    "#641220", "#6E1423", "#6E1423", "#A11D33", "#A11D33", "#A11D33", "#A71E34",
    "#B21E35", "#BD1F36","#C71F37", "#DA1E37", "#E01E37", 
  ];
  colorsEtihad: string[] = [
    "#03045E", "#023E8A", "#0077B6", "#0096C7", "#00B4D8", "#48CAE4", "#90E0EF",
    "#CAF0F8", "00B4D8",
    "#03045E", "#023E8A", "#0077B6", "#0096C7", "#00B4D8", "#48CAE4", "#90E0EF",
    "#CAF0F8", "00B4D8",
    "#03045E", "#023E8A", "#0077B6", "#0096C7", "#00B4D8", "#48CAE4", "#90E0EF",
    "#CAF0F8", "00B4D8",
    "#03045E", "#023E8A", "#0077B6", "#0096C7", "#00B4D8", "#48CAE4", "#90E0EF",
    "#CAF0F8", "00B4D8",
    "#03045E", "#023E8A", "#0077B6", "#0096C7", "#00B4D8", "#48CAE4", "#90E0EF",
    "#CAF0F8", "00B4D8",
  ];
  btnLoading: string = '../../assets/images/loadingBtn.jpg';


  /* Footer-section (dropdown) */
  footerTitle = 'نوع العقار';
  // selectedPropertyType = '';
  selectedPropertyType: string[] = [];
  dropdownOpen = false;
  propertyTypes: any;
  responsData: any;
  cardEtisalat: any;
  cardSewerage: any;
  cardEtihad: any;
  dailyBtnCOlor: String = "#695f58";
  monthlyBtnCOlor: String = "#bfb3a7";
  ngOnInit(): void {
    this.loadOwnershipLandTypes();
    this.loadOwnershipLandData({});
  }
 
  // @HostListener('document:click', ['$event'])
  // toggleDropdown(event: Event) {
  //   this.dropdownOpen = false;
  // }
  toggleDropdown(event?: Event) {
    if (event) {
      event.stopPropagation(); // prevent bubbling to document
    }
    this.dropdownOpen = !this.dropdownOpen;
  }
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-multiselect')) {
      this.dropdownOpen = false;
    }
  }

  onCheckboxChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const value = checkbox.value;

    if (checkbox.checked) {
      if (!this.selectedPropertyType.includes(value)) {
        this.selectedPropertyType.push(value);
      }
    } else {
      this.selectedPropertyType = this.selectedPropertyType.filter(v => v !== value);
    }
  }
  // onClickOutside(event: Event) {
  //   this.dropdownOpen = false;
  // }

  loadOwnershipLandTypes(): void {
    this.lookupsService.loadOwnershipLandTypes().subscribe((data) => {
      console.log(data);
      this.propertyTypes = data.data;
    });
  }
  loadOwnershipLandData(params: any): void {
    console.log("Loading Ownership Land Data...");
    this.cardEtisalat = {
      title: "اتصالات والمزيد",
      logo: '../../assets/ownershipLand/etisalat.jpg',
      count: 0,
      chartData: [],
      chartLabels: [],
      chartColors: []
    };
    this.cardSewerage = {
      title: "عجمان للصرف الصحي",
      logo: '../../assets/ownershipLand/sewerage.jpg',
      count: 0,
      chartData: [],
      chartLabels: [],
      chartColors: []
    };
    this.cardEtihad = {
      title: "الاتحاد للكهرباء والماء",
      logo: '../../assets/ownershipLand/etihad.jpg',
      count: 0, // total count
      chartData: [], //  % 
      chartLabels: [], // landType
      chartColors: [] // list of color #
    };

    this.lookupsService.loadOwnershipLandData(params).subscribe((data) => {
      this.responsData = data.data;
      if (data.data && data.data.etisalat) {

        let etisalat = data.data.etisalat;
        let totalCount = etisalat.reduce((sum: any, item: any) => sum + item.count, 0);
        // let totalCount = 0;
        let chartLabels = [];
        let chartData = [];
        let chartColors = [];
        for (let index = 0; index < etisalat.length; index++) {
          if (etisalat[index].count) {
            // totalCount = totalCount + parseInt(etisalat[index].count);
            let count = ((etisalat[index].count / totalCount) * 100).toFixed(0);
            chartData.push(count);
            chartColors.push(this.colorsEtihad[index]);
            if (etisalat[index].landType) {
              chartLabels.push(etisalat[index].landType);

            }
            else {
              chartLabels.push("غير معروف");
            }
          }
          if ((index + 1) == etisalat.length) {
            this.cardEtisalat.count = totalCount;
            this.cardEtisalat.chartLabels = chartLabels;
            this.cardEtisalat.chartColors = chartColors;
            this.cardEtisalat.chartData = chartData;
          }

        }
      }
      if (data.data && data.data.sewerage) {
        let sewerage = data.data.sewerage;
        let totalCount = sewerage.reduce((sum: any, item: any) => sum + item.count, 0);
        let chartLabels = [];
        let chartData = [];
        let chartColors = [];
        for (let index = 0; index < sewerage.length; index++) {
          if (sewerage[index].count) {
            // totalCount = totalCount + parseInt(sewerage[index].count);
            let count = ((sewerage[index].count / totalCount) * 100).toFixed(0);
            chartData.push(count);
            chartColors.push(this.colorsSewerage[index]);
            if (sewerage[index].landType) {
              chartLabels.push(sewerage[index].landType);
            }
            else {
              chartLabels.push("غير معروف");
            }
          }
          if ((index + 1) == sewerage.length) {
            this.cardSewerage.count = totalCount;
            this.cardSewerage.chartLabels = chartLabels;
            this.cardSewerage.chartColors = chartColors;
            this.cardSewerage.chartData = chartData;
          }

        }
      }
      if (data.data && data.data.etihad) {
        let etihad = data.data.etihad;
        let totalCount = etihad.reduce((sum: any, item: any) => sum + item.count, 0);
        console.log("totalCount " + totalCount);
        let chartLabels = [];
        let chartData = [];
        let chartColors = [];
        for (let index = 0; index < etihad.length; index++) {
          if (etihad[index].count) {
            let count = ((etihad[index].count / totalCount) * 100).toFixed(0);
            chartData.push(count);
            chartColors.push(this.colorsEtihad[index]);
            if (etihad[index].landType) {
              chartLabels.push(etihad[index].landType);
            } else {
              chartLabels.push("غير معروف");
            }
          }
          if ((index + 1) == etihad.length) {
            this.cardEtihad.count = totalCount;
            this.cardEtihad.chartLabels = chartLabels;
            this.cardEtihad.chartColors = chartColors;
            this.cardEtihad.chartData = chartData;
          }

        }
      }
    });
  }
  filterData(key: any): void {
    if (key == "daily") {
      this.dailyBtnCOlor = "#695f58";
      this.monthlyBtnCOlor = "#bfb3a7";
    } else if (key == "monthly") {
      this.dailyBtnCOlor = "#bfb3a7";
      this.monthlyBtnCOlor = "#695f58";
    }
    let obj = { type: key };
    this.loadOwnershipLandData(obj);
  }
  applyFilter(): void {
    let httpParams = new HttpParams();
  
    if (this.fromDate || this.toDate) {
      httpParams = httpParams.set('type', 'period');
      if (this.fromDate) {
        httpParams = httpParams.set('from', this.fromDate);
      }
      if (this.toDate) {
        httpParams = httpParams.set('to', this.toDate);
      }
    }
  
    if (this.selectedPropertyType?.length) {
      this.selectedPropertyType.map(type => type.trim()).forEach(type => {
        httpParams = httpParams.append('landType', type);
      });
    }
  
    this.loadOwnershipLandData(httpParams); // ✅ now it’s correct
  }
  
}
