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
    "#641220", "#6E1423", "#85182A", "#A11D33", "#A71E34", "#B21E35", "#BD1F36",
    "#C71F37", "#DA1E37",
    "#641220", "#6E1423", "#85182A", "#A11D33", "#A71E34", "#B21E35", "#BD1F36",
    "#C71F37", "#DA1E37",
    "#641220", "#6E1423", "#85182A", "#A11D33", "#A71E34", "#B21E35", "#BD1F36",
    "#C71F37", "#DA1E37",
    "#641220", "#6E1423", "#85182A", "#A11D33", "#A71E34", "#B21E35", "#BD1F36",
    "#C71F37", "#DA1E37",
    "#641220", "#6E1423", "#85182A", "#A11D33", "#A71E34", "#B21E35", "#BD1F36",
    "#C71F37", "#DA1E37",
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
  btnLoading :string = '../../assets/images/loadingBtn.jpg';


  /* Footer-section (dropdown) */
  footerTitle = 'نوع العقار';
  selectedPropertyType = '';
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
            chartColors.push(this.colorsEtihad[index]);
            if (etisalat[index].landType) {
              chartLabels.push(etisalat[index].landType);

            }
            else{
              chartLabels.push("غير معروف");
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
            chartColors.push(this.colorsSewerage[index]);
            if (sewerage[index].landType) {
              chartLabels.push(sewerage[index].landType);
            }
            else{
              chartLabels.push("غير معروف");
            }
          }
          if ((index + 1) == sewerage.length) {
            this.cardSewerage.count = totalCount;
            this.cardSewerage.title = "عجمان للصرف الصحي";
            this.cardSewerage.chartLabels = chartLabels;
            this.cardSewerage.chartColors = chartColors;
            this.cardSewerage.chartData = chartData;
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
            chartColors.push(this.colorsEtihad[index]);
            if (etihad[index].landType) {
              chartLabels.push(etihad[index].landType);
            }else{
              chartLabels.push("غير معروف");
            }
          }
          if ((index + 1) == etihad.length) {
            this.cardEtihad.count = totalCount;
            this.cardEtihad.title = "الاتحاد للكهرباء والماء";
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
    console.log(this.fromDate);
    console.log(this.fromDate + " " + this.toDate + " " + this.selectedPropertyType);
    let obj ={};
    if (this.fromDate || this.toDate) {
      obj["type"]="period";
      if (this.fromDate) {
        obj["from"] =this.fromDate;
      }
      if (this.toDate) {
        obj["to"] =this.toDate;
      }
    }
    // let obj = {
    //   type: "period",
    //   from: this.fromDate,
    //   to: this.toDate,
    //   landType: this.selectedPropertyType.trim()
    // };
    // if (this.selectedPropertyType) {
    //   obj["landType"] = this.selectedPropertyType.trim();
    // }
    
    this.loadOwnershipLandData(obj);

  }
}
