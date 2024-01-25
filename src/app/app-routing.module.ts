import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { LoginComponent } from './login/login.component';
import { ResetPasswordComponent } from './ResetPassword/ResetPassword.component';
import { SignupComponent } from './signup/signup.component';
import { CustomPageComponent } from './custom-page/custom-page.component';
import { RuleGeneratorComponent } from './rule-generator/rule-generator.component';
import { ServiceIdResolver } from './service-id.resolver';
import { ServicePageComponent } from './service-page/service-page.component';
import { StepIdResolver } from './stepId.resolver';
import { NotificationPageComponent } from './notification-page/notification-page.component';
import { MyTasksComponent } from './my-tasks/my-tasks.component';
import { AuthenticationGuard } from './authentication.guard';
import { CustomerProfileComponent } from './customer-profile/customer-profile.component';
import { CustomerEditComponent } from './customer-profile/customer-edit/customer-edit.component';
import { CustomerMainViewComponent } from './customer-profile/customer-mainView/customer-mainView.component';
import { ProjectProfileComponent } from './project-profile/project-profile.component';
import { UnitProfileComponent } from './unit-profile/unit-profile.component';
import { UnitEditComponent } from './unit-profile//unit-edit/unit-edit.component';
import { UnitMainViewComponent } from './unit-profile//unit-mainView/unit-mainView.component';
import { CompanyProfileComponent } from './company-profile/company-profile.component';
import { CompanyEditComponent } from './company-profile/company-edit/company-edit.component';
import { CompanyMainViewComponent } from './company-profile/company-mainView/company-mainView.component';
import { CustomerProfileResolver } from './customer-profile.resolver';
import { CustomerDetailsComponent } from './customer-profile/customer-details/customer-details.component';
import { CustomerViewComponent } from './customer-profile/customer-view/customer-view.component';
import { ProjectProfileResolver } from './shared/project-profile.resolver';
import { UnitProfileResolver } from './shared/unit-profile.resolver';
import { CompanyProfileResolver } from './shared/company-profile.resolver';
import { UnitDetailsComponent } from './unit-profile/unit-details/unit-details.component';
import { UnitViewComponent } from './unit-profile/unit-view/unit-view.component';
import { ProjectDetailsComponent } from './project-profile/project-details/project-details.component';
import { ProjectEditComponent } from './project-profile/project-edit/project-edit.component';
import { ProjectViewMainComponent } from './project-profile/project-view-main/project-view-main.component';
import { ProjectViewComponent } from './project-profile/project-view/project-view.component';
import { ErrorPageComponent } from './error-page/error-page.component';
import { CompanyDetailsComponent } from './company-profile/company-details/company-details.component';
import { CompanyViewComponent } from './company-profile/company-view/company-view.component';
import { OwnerProfileComponent } from './owner-profile/owner-profile.component';
import { OwnerProfileResolver } from './shared/owner-profile.resolver';
import { PropertiesProfileResolver } from './shared/properties-profile.resolver';
import { PropertiesProfileComponent } from './properties-profile/properties-profile.component';
import { LandProfileComponent } from './land-profile/land-profile.component';
import { LandEditComponent } from './land-profile/land-edit/land-edit.component';
import { LandMainViewComponent } from './land-profile/land-mainView/land-mainView.component';
import { LandViewComponent } from './land-profile/land-view/land-view.component';
import { RateViewComponent } from './rate/rateView/rate-view.component';
import { newRateComponent } from './rate/newRate/rate-new.component';
import { LandChangeNumberComponent } from './land-profile/landChangeNumber/land-changeNumber.component';
import { LandnumberComponent } from './land-profile/landNumber/land-number.component';
import { LandDetailsComponent } from './land-profile/land-details/land-details.component';
import { LandProfileResolver } from './shared/land-profile.resolver';
import { SearchPageComponent } from './search-page/search-page.component';
import { DeveloperProfileComponent } from './developer-profile/developer-profile.component';
import { DeveloperProfileResolver } from './shared/developer-profile.resolver';
import { DeveloperDetailsComponent } from './developer-profile/developer-details/developer-details.component';
import { LegalBlocksComponent } from './legal-blocks/legal-blocks.component';
import { EngineeringBlocksComponent } from './engineering-blocks/engineering-blocks.component';
import { ApplicationSearchComponent } from './application-search/application-search.component';
import { UnitsExcelUploadComponent } from './units-excel-upload/units-excel-upload.component';
import { SingleApplicationSearchComponent } from './single-application-search/single-application-search.component';
import { ApplicationSearchResolver } from './shared/application_search.resolver';
import { UnitsValuationComponent } from './units-valuation/units-valuation.component';
import { RateDetailsComponent } from './rate/rateDetails/rate-details.component';
import { PricingUnitComponent } from './rate/pricingUnit/pricingUnit-search.component';
import { PricingUnitDetailsComponent } from './rate/pricingUnitDetails/pricingUnit-details.component';
import { LandCancelViewComponent } from './land-cancel/land-cancel-main/land-cancel-view.component';
import {  LandCancelDetailsComponent} from './land-cancel/land-cancel-details/land-cancel-details.component';
const routes: Routes = [
  { path: '', component: HomePageComponent, canActivate: [AuthenticationGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'ResetPassword/:id', component: ResetPasswordComponent },
  // { path: 'signup',  component: SignupComponent },
  { path: 'error', component: ErrorPageComponent },
  { path: 'custom_page', component: CustomPageComponent, canActivate: [AuthenticationGuard] },
  { path: 'my_tasks', component: MyTasksComponent, canActivate: [AuthenticationGuard] },
  { path: 'rule_generator', component: RuleGeneratorComponent, canActivate: [AuthenticationGuard] },
  { path: 'service/:serviceId', component: ServicePageComponent, resolve: { serviceId: ServiceIdResolver }, canActivate: [AuthenticationGuard] },
  { path: 'notifications/:stepId', component: NotificationPageComponent, resolve: { stepId: StepIdResolver }, canActivate: [AuthenticationGuard] },
  { path: 'customer/new', component: CustomerProfileComponent, resolve: { profile: CustomerProfileResolver }, canActivate: [AuthenticationGuard] },
  { path: 'customer/edit', component: CustomerEditComponent, resolve: { profile: ProjectProfileResolver }, canActivate: [AuthenticationGuard] },
  { path: 'customer/view', component: CustomerMainViewComponent, resolve: { profile: ProjectProfileResolver }, canActivate: [AuthenticationGuard] },
  {
    path: 'customer/profile/:profileId', component: CustomerProfileComponent,
    resolve: { profile: CustomerProfileResolver },
    canActivate: [AuthenticationGuard],
    children: [
      { path: '', redirectTo: 'edit', pathMatch: 'full' },
      { path: 'edit', component: CustomerDetailsComponent },
      { path: 'view', component: CustomerViewComponent }

    ]
  },
  { path: 'project/new', component: ProjectProfileComponent, resolve: { profile: ProjectProfileResolver }, canActivate: [AuthenticationGuard] },
  { path: 'project/edit', component: ProjectEditComponent, resolve: { profile: ProjectProfileResolver }, canActivate: [AuthenticationGuard] },
  { path: 'project/view', component: ProjectViewMainComponent, resolve: { profile: ProjectProfileResolver }, canActivate: [AuthenticationGuard] },
  {
    path: 'project/profile/:profileId', component: ProjectProfileComponent,
    resolve: { profile: ProjectProfileResolver }, canActivate: [AuthenticationGuard],
    children: [
      { path: '', redirectTo: 'edit', pathMatch: 'full' },
      { path: 'edit', component: ProjectDetailsComponent },
      { path: 'view', component: ProjectViewComponent }
    ]
  },
  { path: 'unit/new', component: UnitProfileComponent, resolve: { profile: UnitProfileResolver }, canActivate: [AuthenticationGuard] },
  { path: 'unit/edit', component: UnitEditComponent, resolve: { profile: UnitProfileResolver }, canActivate: [AuthenticationGuard] },
  { path: 'unit/view', component: UnitMainViewComponent, resolve: { profile: UnitProfileResolver }, canActivate: [AuthenticationGuard] },
  {
    path: 'unit/profile/:profileId', component: UnitProfileComponent,
    resolve: { profile: UnitProfileResolver },
    canActivate: [AuthenticationGuard],
    children: [
      { path: '', redirectTo: 'edit', pathMatch: 'full' },
      { path: 'edit', component: UnitDetailsComponent },
      { path: 'view', component: UnitViewComponent }
    ]
  },
  { path: 'company/new', component: CompanyProfileComponent, resolve: { profile: CompanyProfileResolver }, canActivate: [AuthenticationGuard] },
  { path: 'company/edit', component: CompanyEditComponent, resolve: { profile: CompanyProfileResolver }, canActivate: [AuthenticationGuard] },
  { path: 'company/view', component: CompanyMainViewComponent, resolve: { profile: CompanyProfileResolver }, canActivate: [AuthenticationGuard] },
  {
    path: 'company/profile/:profileId', component: CompanyProfileComponent,
    resolve: { profile: CompanyProfileResolver },
    canActivate: [AuthenticationGuard],
    children: [
      { path: '', redirectTo: 'edit', pathMatch: 'full' },
      { path: 'edit', component: CompanyDetailsComponent },
      { path: 'view', component: CompanyViewComponent }
    ]
  },
  { path: 'rate', component: RateViewComponent, resolve: { profile: LandProfileResolver }, canActivate: [AuthenticationGuard] },
  { path: 'pricingUnit', component: PricingUnitComponent, resolve: { profile: LandProfileResolver }, canActivate: [AuthenticationGuard] },
  { path: 'rate/new', component: newRateComponent, resolve: { profile: LandProfileResolver }, canActivate: [AuthenticationGuard] },
  {
    path: 'rate/profile/:profileId/:profileId2', component: RateViewComponent,
    resolve: { profile: ProjectProfileResolver },
    canActivate: [AuthenticationGuard],
    children: [
      { path: 'view', component: RateDetailsComponent },
    ]
  },
  {
    path: 'pricingUnit/profile/:profileId/:profileId2', component: RateViewComponent,
    resolve: { profile: ProjectProfileResolver },
    canActivate: [AuthenticationGuard],
    children: [
      { path: 'view', component: PricingUnitDetailsComponent },
    ]
  },
  { path: 'land/new', component: LandProfileComponent, resolve: { profile: LandProfileResolver }, canActivate: [AuthenticationGuard] },
  { path: 'land/changeNumber', component: LandChangeNumberComponent, resolve: { profile: LandProfileResolver }, canActivate: [AuthenticationGuard] },
  { path: 'land/edit', component: LandEditComponent, resolve: { profile: LandProfileResolver }, canActivate: [AuthenticationGuard] },
  { path: 'land/view', component: LandMainViewComponent, resolve: { profile: LandProfileResolver }, canActivate: [AuthenticationGuard] },
  {
    path: 'land/profile/:profileId', component: LandProfileComponent,
    resolve: { profile: LandProfileResolver },
    canActivate: [AuthenticationGuard],
    children: [
      { path: '', redirectTo: 'edit', pathMatch: 'full' },
      { path: 'edit', component: LandDetailsComponent },
      { path: 'view', component: LandViewComponent },
      { path: 'landNumber', component: LandnumberComponent }
    ]
  },
  { path: 'developer/new', component: DeveloperProfileComponent, resolve: { profile: DeveloperProfileResolver }, canActivate: [AuthenticationGuard] },
  {
    path: 'developer/profile/:profileId', component: DeveloperProfileComponent,
    resolve: { profile: DeveloperProfileResolver },
    canActivate: [AuthenticationGuard],
    children: [
      { path: '', redirectTo: 'edit', pathMatch: 'full' },
      { path: 'edit', component: DeveloperDetailsComponent }
    ]
  },
  {
    path: 'owner/profile/:profileId/edit', component: OwnerProfileComponent,
    resolve: { profile: OwnerProfileResolver },
    canActivate: [AuthenticationGuard]
  },
  {
    path: 'properties/profile/:profileId/edit', component: PropertiesProfileComponent,
    resolve: { profile: PropertiesProfileResolver },
    canActivate: [AuthenticationGuard]
  },
  { path: 'search', component: SearchPageComponent, canActivate: [AuthenticationGuard] },
  { path: 'legal_blocks', component: LegalBlocksComponent, canActivate: [AuthenticationGuard] },
  { path: 'engineering_blocks', component: EngineeringBlocksComponent, canActivate: [AuthenticationGuard] },
  { path: 'application_search', component: ApplicationSearchComponent, canActivate: [AuthenticationGuard] },
  { path: 'units_excel_upload', component: UnitsExcelUploadComponent, canActivate: [AuthenticationGuard] },
  { path: 'application_search/:applicationId', component: SingleApplicationSearchComponent, canActivate: [AuthenticationGuard], resolve: { application_search: ApplicationSearchResolver } },
  { path: 'units_valuation', component: UnitsValuationComponent, canActivate: [AuthenticationGuard] },
  { path: 'landCancel', component: LandCancelViewComponent, canActivate: [AuthenticationGuard] },
  {
    path: 'landCancel/profile/:profileId', component: LandProfileComponent,
    resolve: { profile: LandProfileResolver },
    canActivate: [AuthenticationGuard],
    children: [
      { path: '', redirectTo: 'edit', pathMatch: 'full' },
      { path: 'view', component: LandCancelDetailsComponent },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { paramsInheritanceStrategy: 'always' })],
  exports: [RouterModule],
  providers: [
    StepIdResolver,
    ServiceIdResolver,
    CustomerProfileResolver,
    ProjectProfileResolver,
    UnitProfileResolver,
    CompanyProfileResolver,
    OwnerProfileResolver,
    PropertiesProfileResolver,
    LandProfileResolver,
    DeveloperProfileResolver,
    ApplicationSearchResolver
  ]
})
export class AppRoutingModule { }
