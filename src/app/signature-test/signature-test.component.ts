import { Component } from '@angular/core';

@Component({
  selector: 'app-signature-test',
  templateUrl: './signature-test.component.html',
  styleUrls: ['./signature-test.component.css']
})
export class SignatureTestComponent {
  formData: any = {};
  
  myMockField: any = {
    fieldID: 'mockSignatures',
    fieldType: 'signatureCollection',
    auxInfo: {
      source: 'api',
      sourceDetails: 'http://wfe.ajre.gov.test/AjmanLandProperty/index.php/Lands/ownersForUnitsSignatureTest',
      method: 'post',
      apiParams: []
    }
  };
}
