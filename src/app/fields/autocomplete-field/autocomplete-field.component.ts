import { Component, OnInit, Input } from '@angular/core';
import { Field } from '../fields';
import { ControlContainer, NgForm } from '@angular/forms';
import { FieldsService } from 'src/app/shared/fields.service';
import { Observable, Subject, concat, of } from 'rxjs';
import { distinctUntilChanged, tap, switchMap, catchError } from 'rxjs/operators';



@Component({
  selector: 'app-autocomplete-field',
  templateUrl: './autocomplete-field.component.html',
  styleUrls: ['./autocomplete-field.component.css'],
  viewProviders: [ { provide: ControlContainer, useExisting: NgForm } ]
})
export class AutocompleteFieldComponent implements OnInit {
  dataOptions: Observable<any>;
  dataOptionsLoading = false;
  searchInput$ = new Subject<string>();

  @Input() field: Field;

  @Input() customClass: string;

  @Input() formData: any;

  @Input() index: any = 0;

  @Input() row: any;

  @Input() fullFormData: any;
  
  @Input() formErrors: any;

  @Input() defaultValues: any;

  constructor(private service: FieldsService) { }

  ngOnInit(): void {
    // this.dataOptions = this.service.getFieldData(this.field, this.formData)
    this.loadData();
    this.getDefaultValue(this.field.fieldID);
  }

  getFieldModelName(field: Field) {
    return this.service.getModelName(field.fieldID, this.fullFormData);
  }

  setmyvalue(event: any) {
    console.log('value changed', event.target.value);
    if (event.target.value.length > 3) {
      this.dataOptions = this.service.getFieldData(this.field, this.formData);
    }
  }

  private loadData() {
    this.dataOptions = concat(
      of([]), // default items
      this.searchInput$.pipe(
          distinctUntilChanged(),
          tap(() => this.dataOptionsLoading = true),
          switchMap(term => {
            return this.service.getFieldData(this.field, this.fullFormData, {term}).pipe(
              catchError(() => of([])), // empty list on error
              tap(() => this.dataOptionsLoading = false)
          )})
      )
  );
  }

  getText(field: any, key: string) {
    return this.service.getText(field, key);
  }

  getName(field_name) {
    return this.service.getFieldName(field_name, this.row, this.index);
  }

  showErrors(field_name: any) {
    return this.service.showErrors(field_name, this.formErrors);
  }

  getErrors(field_name: any) {
    return this.service.getErrors(field_name, this.formErrors);
  }

  getDefaultValue(field_name: any) {
    this.formData[this.field.fieldID] = this.service.getDefaultValue(field_name, this.defaultValues, this.index);
    if (!!this.formData[this.field.fieldID])
      this.prepareDisplayValues();
  }

  isRequired() {
    return this.service.isRequired(this.field.required);
  }

  setDisplayValue(option: any) {
    this.formData[this.field.fieldID + '_displayValue'] = option && option.value.ar;
  }

  prepareDisplayValues() {
    this.dataOptions.subscribe(data => {
      let defaultOption = data.find(d => d.key == this.formData[this.field.fieldID]);
      if (!!defaultOption) {
        this.setDisplayValue(defaultOption);
      }
    })
  }

}
