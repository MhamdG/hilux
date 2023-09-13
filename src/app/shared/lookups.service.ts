import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { environment } from '../../environments/environment';
import { FieldsService } from './fields.service';

@Injectable()
export class LookupsService {

  constructor(private fieldsService: FieldsService) {}

  loadCompanyTypeOptions(params: any = {}) {
    return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/Lookups/companiesTypes`, params);
  }

  loadEmiratesOptions(params: any = {}) {
    return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/Lookups/emirates`, params);
  }

  loadLicenseTypeOptions(params: any = {}) {
    return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/Lookups/licensesTypes`, params);
  }

  loadLicenseIssuerOptions(params: any = {}) {
    return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/Lookups/companiesLicensesIssuers`, params);
  }

  loadRegistrationTypes(params: any = {}) {
    return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/lookups/registrationTypes`, params);
  }

  loadUnitsTypesOptions(params: any = {}) {
    return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/lookups/unitsTypes`, params);
  }

  loadUnitsOptions(params: any = {}) {
    return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/Lookups/units`, params);
  }
  loadUnitsByUnitIDOptions(params: any = {}) {
    return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/Lookups/unitsByUnitID`, params);
  }

  loadServiceNamesOptions(params: any = {}) {
    return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/ServiceCategories/listOfServices`, params);
  }

  loadServiceNamesOptionsByUser(params: any = {}) {
    return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/ServiceCategories/listOfServicesByUser`, params);
  }

  loadProjects(params: any = {}) {
    return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/Lookups/projectsUnactiveSH`, params);
  }
  loadAllProjects(params: any = {}) {
    return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/Lookups/allProjects`, params);
  }
  loadApartments(params: any = {}) {
    return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/Lookups/unitsTypesForTathmeen`, params);
  }
  loadNewProjects(params: any = {}) {
    return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/Lookups/newProjects`, params);
  }

  loadDevelopers(params: any = {}) {
    return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/Lookups/developers`, params);
  }
  loaddevelopersStatusTypes(params: any = {}) {
    return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/Lookups/developersStatusTypes`, params);
  }

  loadLands(params: any = {}) {
    return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/Lookups/lands`, params);
  }

  loadOldLands(params: any = {}) {
    return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/Lookups/oldLands`, params);
  }

  loadOwners(params: any = {}) {
    return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/lookups/owners`, params);
  }
  loadOwners3(params: any = {}) {
    return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/lookups/owners3`, params);
  }

  loadCustomers(params: any = {}) {
    return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/lookups/customers`, params);
  }

  loadContactPerferencesOptions(params: any = {}) {
    return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/Lookups/contactPreferencesTypes`, params);
  }

  loadTimeToContactOptions(params: any = {}) {
    return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/Lookups/timeToContactPreferences`, params);
  }

  loadNationalitiesOptions(params: any = {}) {
    return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/Lookups/nationalities`, params);
  }

  loadCustomerCategoryOptions(params: any = {}) {
    return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/Lookups/customersCategories`, params);
  }

  loadCustomerTypesOptions(params: any = {}) {
    return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/Lookups/customerTypes`, params);
  }

  loadOtherIdTypesOptions(params: any = {}) {
    return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/Lookups/otherIdTypes`, params);
  }

  loadDisablilityTypesOptions(params: any = {}) {
    return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/Lookups/disabilityTypes`, params);
  }

  loadCompanies(params: any = {}) {
    return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/Lookups/companies`, params);
  }

  loadBlockageTypesOptions(params: any = {}) {
    return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/Lookups/blockagesTypes`, params);
  }

  loadBlockageEntities(params: any = {}) {
    return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/Lookups/blockagesEntities`, params);
  }

  loadSectorsOptions(params: any = {}) {
    return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/Lookups/sectors`, params);
  }

  loadSectionsOptions(params: any = {}) {
    return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/Lookups/sections`, params);
  }

  loadStreetNamesOptions(params: any = {}) {
    return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/Lookups/streetsnames`, params);
  }

  loadStreetTypesOptions(params: any = {}) {
    return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/Lookups/streetstypes`, params);
  }

  loadMainUsageTypesOptions(params: any = {}) {
    return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/Lookups/mainUsageTypes`, params);
  }

  loadSubUsageTypesOptions(params: any = {}) {
    return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/Lookups/subUsageTypes`, params);
  }

  loadCitiesOptions(params: any = {}) {
    return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/Lookups/cities`, params);
  }

  loadPropertyTypesOptions(params: any = {}) {
    return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/Lookups/landsTypes`, params);
  }

  loadProjectsTypesOptions(params: any = {}) {
    return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/lookups/projectstypes`, params);
  }

  loadProjectStatusOptions(params: any = {}) {
    return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/lookups/projectsStatuses`, params);
  }

  loadProjectsRegistrationTypesOptions(params: any = {}) {
    return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/lookups/projectsRegistrationTypes`, params);
  }

  loadProjectUsageTypesOptions(params: any = {}) {
    return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/lookups/projectsUsageTypes`, params);
  }

  loadContractorsOptions(params: any = {}) {
    return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/Lookups/projetcsContractors`, params);
  }

  loadConsultantsOptions(params: any = {}) {
    return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/Lookups/projetcsConsultants`, params);
  }

  loadAccountTrusteesOptions(params: any = {}) {
    return this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/Lookups/projetcsAccountTrusteeBanks`, params);
  }
}
