import { Component, OnInit, Input } from '@angular/core';
import { Field } from '../fields';
import { FieldsService } from 'src/app/shared/fields.service';
import { ControlContainer, NgForm } from '@angular/forms';
import * as _ from 'lodash';
import {  Router } from '@angular/router';

@Component({
  selector: 'app-entity-select',
  templateUrl: './entity-select.component.html',
  styleUrls: ['./entity-select.component.css'],
  viewProviders: [ { provide: ControlContainer, useExisting: NgForm } ]
})
export class EntitySelectComponent implements OnInit {
  dataOptions: any;

  @Input() field: Field;

  @Input() customClass: string;

  @Input() formData: any;

  @Input() row: any;

  @Input() index: any = 0;

  @Input() fullFormData: any;

  @Input() formErrors: any;

  @Input() defaultValues: any;

  constructor(private service: FieldsService, private router: Router,) { }

  ngOnInit(): void {
    this.service.getFieldData(this.field, this.fullFormData).subscribe((data)=> {
      this.dataOptions = data;
      this.getDefaultValue(this.field.fieldID);
    })
  }

  getFieldName(name: string, index: any) {
    return this.service.getFieldName(name, this.row, this.index) + `_${index}`;
  }

  showErrors(field_name: any) {
    return this.service.showErrors(field_name, this.formErrors);
  }

  getErrors(field_name: any) {
    return this.service.getErrors(field_name, this.formErrors);
  }

  getDefaultValue(field_name: any) {
    let defaultVlaue = this.service.getDefaultValue(field_name, this.defaultValues, (this.index || 0));
    this.formData[this.field.fieldID] = (defaultVlaue ? defaultVlaue.map(d => d.toString()) : defaultVlaue);
  }

  getName(field_name) {
    return this.service.getFieldName(field_name, this.row, this.index);
  }

  isChecked(option: any) {
    return this.formData[this.field.fieldID] && this.formData[this.field.fieldID].includes(option.toString());
  }

  handleChange($event) {
    if (!this.formData[this.field.fieldID])
      this.formData[this.field.fieldID] = [];

    if ($event.target.checked) {
      this.formData[this.field.fieldID].push($event.target.value);
    } else {
      _.remove(this.formData[this.field.fieldID], i => i === $event.target.value);
      if (this.formData[this.field.fieldID].length == 0) {
        this.formData[this.field.fieldID] = undefined;
      }
    }
  }

  getText(field: any, key: string) {
    return this.service.getText(field, key);
  }

  hasErrors() {
    let errors = false;
    if (this.field.required == 'true') {
      errors = errors = this.formData[this.field.fieldID] == undefined;
    }

    return errors;
  }

  isRequired() {
    return this.service.isRequired(this.field.required, this.field.fieldID);
  }

  isActiveEditStep() {
    return this.service.isEditStep && (this.service.editStepField != this.field.fieldID);
  }

  isActiveRejectStep() {
    return this.service.isRejectStep && (this.service.rejectReasonField != this.field.fieldID);
  }
  // navigateFun(id:any){
  //   console.log(id);
  //   let url ='owner/profile/'+id+'/edit';
  //   console.log(url);
  //   this.router.navigate(['owner/profile/', id, 'edit']);
  //   // window.open(url, '_blank');
  // }
  navigateFun(routeId: any, routeName: any) {
      return `/${routeName}/profile/${routeId}/edit`;
  }
}
