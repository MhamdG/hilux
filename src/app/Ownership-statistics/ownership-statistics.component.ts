import { Component, OnInit } from '@angular/core';
import { ChartType, ChartOptions } from 'chart.js';
import { LookupsService } from '../shared/lookups.service';
// import { LookupsService } from '../../assets/ownershipLand/';

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
  card1: StatCard = {
    title: 'الاتحاد للكهرباء والماء',
    count: '125,000',
    unit: 'عدد المستفيدين',
    logo: 'assets/we.png',
    chartData: [47.6, 19, 9.5, 23.9],
    chartLabels: ['تجاري', 'فيلا', 'أراضي', 'أخرى'],
    chartColors: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
  };

  card2: StatCard = {
    title: 'عجمان للصرف الصحي',
    count: '125,000',
    unit: 'عدد المستفيدين',
    logo: 'assets/etisalat.png',
    chartData: [47.6, 19, 9.5, 23.9],
    chartLabels: ['تجاري', 'فيلا', 'أراضي', 'أخرى'],
    chartColors: ['#9966FF', '#34D399', '#FBBF24', '#60A5FA'],
  };

  card3: StatCard = {
    title: 'اتصالات والمزيد',
    count: '125,000',
    unit: 'عدد المستفيدين',
    logo: 'assets/etisalat.png',
    chartData: [23.8, 47.0, 3.9, 2.3, 4.0, 1.9],
    chartLabels: ['تجاري', 'فيلا', 'أراضي', 'سكني', 'تجاري 2', 'أخرى'],
    chartColors: ['#FF9F40', '#4D96FF', '#6BCB77', '#FF6B6B', '#845EC2', '#FFC154'],
  };
  colors: string[] = [
    '#fb8500', '#ffb703', '#023047', '#219ebc', '#8ecae6', '#a2d2ff', '#bde0fe',
    '#ffafcc', '#ffc8dd', '#cdb4db', '#03045e', '#023e8a', '#0077b6', '#0096c7',
    '#ade8f4', '#caf0f8', '#ef476f', '#ffd166', '#06d6a0', '#118ab2', '#073b4c',
    '#780000', '#fdf0d5', '#f72585', '#4361ee', '#edf2fb', '#d7e3fc', '#c1d3fe',
    '#c1121f', '#003049', '#7209b7', '#4cc9f0', '#e2eafc', '#ccdbfd', '#abc4ff',
  ];
  

  /* Footer-section (dropdown) */
  footerTitle = 'إحصائيات حسب نوع العقار';
  selectedPropertyType = 'تجاري';
  propertyTypes:any;
  responsData:any;
  cardEtisalat :any;
  cardSewerage :any;
  cardEtihad :any;
  ngOnInit(): void {
    this.loadOwnershipLandTypes();
    this.loadOwnershipLandData({});
  }



  loadOwnershipLandTypes(): void {
    this.lookupsService.loadOwnershipLandTypes().subscribe((data) => {
      console.log(data);
      this.propertyTypes = data.data;
    });
  }
  loadOwnershipLandData(params: any): void {
    console.log("Loading Ownership Land Data...");
    this.cardEtisalat = {
      title: "",
      logo: '../../assets/ownershipLand/etisalat.jpg',
      count: 0,
      chartData: [],
      chartLabels: [],
      chartColors: []
    };
    this.cardSewerage = {
      title: "",
      logo: '../../assets/ownershipLand/sewerage.jpg',
      count: 0,
      chartData: [],
      chartLabels: [],
      chartColors: []
    };
    this.cardEtihad = {
      title: "",
      logo: '../../assets/ownershipLand/etihad.jpg',
      count: 0,
      chartData: [],
      chartLabels: [],
      chartColors: []
    };
  
    this.lookupsService.loadOwnershipLandData(params).subscribe((data) => {
      this.responsData = data.data;
      if (data.data && data.data.etisalat) {
        let etisalat = data.data.etisalat;
        let totalCount = 0;
        let chartLabels = [];
        let chartData = [];
        let chartColors = [];
        for (let index = 0; index < etisalat.length; index++) {
          if (etisalat[index].count) {
            totalCount = totalCount + parseInt(etisalat[index].count);
            chartData.push(etisalat[index].count);
            chartColors.push(this.colors[index]);
            if (etisalat[index].landType) {
              chartLabels.push(etisalat[index].landType);

            }
          }
          if ((index + 1) == etisalat.length) {
            this.cardEtisalat.count = totalCount;
            this.cardEtisalat.chartLabels = chartLabels;
            this.cardEtisalat.chartColors = chartColors;
            this.cardEtisalat.chartData = chartData;
            this.cardEtisalat.title = "اتصالات والمزيد";
          }

        }
      }
      if (data.data && data.data.sewerage) {
        let sewerage = data.data.sewerage;
        let totalCount = 0;
        let chartLabels = [];
        let chartData = [];
        let chartColors = [];
        for (let index = 0; index < sewerage.length; index++) {
          if (sewerage[index].count) {
            totalCount = totalCount + parseInt(sewerage[index].count);
            chartData.push(sewerage[index].count);
            chartColors.push(this.colors[index]);
            if (sewerage[index].landType) {
              chartLabels.push(sewerage[index].landType);
            }
          }
          if ((index + 1) == sewerage.length) {
            this.cardSewerage.count = totalCount;
            this.cardSewerage.title = "عجمان للصرف الصحي";
            this.cardEtisalat.chartLabels = chartLabels;
            this.cardEtisalat.chartColors = chartColors;
            this.cardEtisalat.chartData = chartData;
          }

        }
      }
      if (data.data && data.data.etihad) {
        let etihad = data.data.etihad;
        let totalCount = 0;
        let chartLabels = [];
        let chartData = [];
        let chartColors = [];
        for (let index = 0; index < etihad.length; index++) {
          if (etihad[index].count) {
            totalCount = totalCount + parseInt(etihad[index].count);
            chartData.push(etihad[index].count);
            chartColors.push(this.colors[index]);
            if (etihad[index].landType) {
              chartLabels.push(etihad[index].landType);
            }
          }
          if ((index + 1) == etihad.length) {
            this.cardEtihad.count = totalCount;
            this.cardEtihad.title = "الاتحاد للكهرباء والماء";
            this.cardEtisalat.chartLabels = chartLabels;
            this.cardEtisalat.chartColors = chartColors;
            this.cardEtisalat.chartData = chartData;
          }

        }
      }
    });
  }
  filterData(key: any): void {
    let obj = { type: key };
    this.loadOwnershipLandData(obj);
  }
  applyFilter(): void {
    console.log(this.fromDate);
    console.log(this.fromDate + " " + this.toDate + " " + this.selectedPropertyType);
    let obj = {
      type: "period",
      from: this.fromDate,
      to: this.toDate,
      landType: this.selectedPropertyType.trim()
    };
    this.loadOwnershipLandData(obj);

  }
}
