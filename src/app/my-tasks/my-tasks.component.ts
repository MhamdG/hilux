import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FieldsService } from '../shared/fields.service';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';


declare var $;

@Component({
  selector: 'app-my-tasks',
  templateUrl: './my-tasks.component.html',
  styleUrls: ['./my-tasks.component.css']
})
export class MyTasksComponent implements OnDestroy, OnInit {

  // response: Observable<any>;
  // @ViewChild('dataTable') dataTable: ElementRef;
  response: any;

  dtOptions = {};
  dtTrigger: Subject<any> = new Subject();

  expand=[]

  constructor(
    private fieldsService: FieldsService,
    private router: Router
  ) { }

  // ngAfterViewChecked() {
  //   this.table = $(this.dataTable.nativeElement);
  //   this.table.dataTable();
  // }

  ngOnInit(): void {
    this.displayData();
    // this.response = this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/applications/myTasks`);
  }

  displayData() {
    this.dtOptions = {
      language: {
        sEmptyTable: 'ليست هناك بيانات متاحة في الجدل',
        sLoadingRecords: 'جارٍ التحميل...',
        sProcessing: 'جارٍ التحميل...',
        sLengthMenu: 'أظهر _MENU_ مدخلات',
        sZeroRecords: 'لم يعثر على أية سجلات',
        sInfo: 'إظهار _START_ إلى _END_ من أصل _TOTAL_ مدخل',
        sInfoEmpty: 'يعرض 0 إلى 0 من أصل 0 سجل',
        sInfoFiltered: '(منتقاة من مجموع _MAX_ مُدخل)',
        sInfoPostFix: '',
        sSearch: 'ابحث:',
        sUrl: '',
        oPaginate: {
          sFirst: 'الأول',
          sPrevious: 'السابق',
          sNext: 'التالي',
          sLast: 'الأخير'
        },
        oAria: {
          sSortAscending: ': تفعيل لترتيب العمود تصاعدياً',
          sSortDescending: ': تفعيل لترتيب العمود تنازلياً'
        }
      }
    };

    this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/applications/myTasks`).subscribe(
      dataResponse => {
        this.response = dataResponse;
        this.dtTrigger.next();
      },
      error => {
        console.log(error);
      }
    );
  }
  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }
  getItemText(field: any, key: any) {
    return ((field[key] && JSON.parse(field[key])).ar || '');
  }

  getTimeAvailable(item: any) {
    if (item.stepDetails.status === 'completed') {
      return (item.stepDetails.latestUserIDTimeStamp || item.stepDetails.timeStampInEffect);
    } else {
      return item.stepDetails.timeStampInEffect;
    }
  }

  getStatusClass(item: any) {
    switch (item.stepDetails.status.toLowerCase()) {
      case 'pending':
        return 'badge-danger';
      case 'completed':
        return 'badge-success';
      case 'locked':
        return 'badge-warning';
      default:
        return 'text-info';
    }
  }

  checkStatusClass(item: any) {
    switch (item.stepDetails.status.toLowerCase()) {
      case 'pending':
        return true;
      case 'completed':
      case 'locked':
        return false;
      default:
        return true;
    }
  }



  performActionPerStatus(item: any) {
    if (item.stepDetails.status.toLowerCase() === 'pending') {
      this.router.navigate(['/notifications', item.stepDetails.applicationWorkflowStepID]);
    }
  }

  getStepDetails(item: any) {
    return JSON.parse(item.applicationDetails.stepsExecuted);
  }
  getStepDetailsFirst(item: any) {
    return JSON.parse(item.applicationDetails.stepsExecuted)[0];
  }
}
