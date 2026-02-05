import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { DeedService } from './deed.service';
import { ToastrService } from 'ngx-toastr';
import { LookupsService } from '../shared/lookups.service';
import { Observable, Subject, concat, of } from 'rxjs';
import { distinctUntilChanged, tap, switchMap, catchError } from 'rxjs/operators';

@Component({
    selector: 'app-deed-search',
    templateUrl: './deed-search.component.html',
    styleUrls: ['./deed-search.component.css']
})
export class DeedSearchComponent implements OnInit {
    searchForm: FormGroup;
    editForm: FormGroup;
    searchType: 'land' | 'project' | 'property' = 'land';
    createSearchType: 'land' | 'project' | 'property' = 'land'; // Default to property for creation
    searchResult: any[] = []; // Now expect an array of deeds
    isLoading = false;
    showEditModal = false;
    showCreateModal = false;
    createForm: FormGroup;
    selectedDeed: any;
    propertyDetails: any; // Store Property Details


    // Lookups
    developerOptions: Observable<any>;
    projectsOptions: Observable<any>;
    unitOptions: Observable<any>;
    landOptions: Observable<any>;

    developerSearchInput$ = new Subject<string>();
    projectsSearchInput$ = new Subject<string>();
    unitSearchInput$ = new Subject<string>();
    landSearchInput$ = new Subject<string>();


    // Create Modal Lookups
    createLandOptions: Observable<any>;
    createDeveloperOptions: Observable<any>;
    createProjectsOptions: Observable<any>;
    createUnitOptions: Observable<any>;
    createLandSearchInput$ = new Subject<string>();
    createDeveloperSearchInput$ = new Subject<string>();
    createProjectsSearchInput$ = new Subject<string>();
    createUnitSearchInput$ = new Subject<string>();

    // Owner Lookup (Shared for Edit and Create)
    ownerOptions: Observable<any>;
    ownerSearchInput$ = new Subject<string>();
    ownerDataOptionsLoading = false;

    developerDataOptionsLoading = false;
    projectDataOptionsLoading = false;
    unitDataOptionsLoading = false;
    landDataOptionsLoading = false;


    createDeveloperDataOptionsLoading = false;
    createProjectDataOptionsLoading = false;
    createLandDataOptionsLoading = false;
    createUnitDataOptionsLoading = false;

    constructor(
        private fb: FormBuilder,
        private deedService: DeedService,
        private toastr: ToastrService,
        private lookupsService: LookupsService
    ) { }

    ngOnInit() {
        this.initForms();
        this.loadDeveloperOptions();
        this.loadProjectsOptions();
        this.loadSearchUnitOptions();
        this.loadLandOptions();


        // Load Create Modal Options
        this.loadCreateLandOptions();
        this.loadCreateDeveloperOptions();
        this.loadCreateProjectsOptions();
        this.loadCreateUnitOptions();
        this.loadCreateUnitOptions();
        this.loadOwnerOptions();
    }

    // --- Search Lookups ---

    loadOwnerOptions() {
        this.ownerOptions = concat(
            of([]), // default items
            this.ownerSearchInput$.pipe(
                distinctUntilChanged(),
                tap(() => this.ownerDataOptionsLoading = true),
                switchMap(term => {
                    return this.lookupsService.loadOwners({ term }).pipe(
                        catchError(() => of([])), // empty list on error
                        tap(() => this.ownerDataOptionsLoading = false)
                    );
                })
            )
        );
    }

    loadLandOptions() {
        console.log('Loading Land Options initiated');
        this.landOptions = concat(
            of([]), // default items
            this.landSearchInput$.pipe(
                distinctUntilChanged(),
                tap(() => this.landDataOptionsLoading = true),
                switchMap(term => {
                    return this.lookupsService.loadLands({ term }).pipe(
                        catchError(() => of([])), // empty list on error
                        tap(() => this.landDataOptionsLoading = false)
                    );
                })
            )
        );
    }

    loadDeveloperOptions() {
        this.developerOptions = concat(
            of([]), // default items
            this.developerSearchInput$.pipe(
                distinctUntilChanged(),
                tap(() => this.developerDataOptionsLoading = true),
                switchMap(term => {
                    return this.lookupsService.loadDevelopers({ term }).pipe(
                        catchError(() => of([])), // empty list on error
                        tap(() => this.developerDataOptionsLoading = false)
                    );
                })
            )
        );
    }

    loadProjectsOptions() {
        this.projectsOptions = concat(
            of([]), // default items
            this.projectsSearchInput$.pipe(
                distinctUntilChanged(),
                tap(() => this.projectDataOptionsLoading = true),
                switchMap(term => {
                    // Pass developerId if available to filter projects
                    const developerId = this.searchForm.get('developerId')?.value;
                    return this.lookupsService.loadAllProjects({ term, developerId }).pipe(
                        catchError(() => of([])), // empty list on error
                        tap(() => this.projectDataOptionsLoading = false)
                    );
                })
            )
        );
    }

    loadSearchUnitOptions() {
        this.unitOptions = concat(
            of([]), // default items
            this.unitSearchInput$.pipe(
                distinctUntilChanged(),
                tap(() => this.unitDataOptionsLoading = true),
                switchMap(term => {
                    const projectId = this.searchForm.get('projectId')?.value;
                    if (!projectId) {
                        this.unitDataOptionsLoading = false;
                        return of([]);
                    }
                    return this.lookupsService.loadUnitsOptions({ term, projectId }).pipe(
                        catchError(() => of([])), // empty list on error
                        tap(() => this.unitDataOptionsLoading = false)
                    );
                })
            )
        );
    }

    onSearchProjectChange() {
        this.searchForm.get('unitNumber')?.setValue(null);
        this.loadSearchUnitOptions(); // Reload to pick up new projectId
    }

    // --- Create Modal Loopups ---
    loadCreateLandOptions() {
        this.createLandOptions = concat(
            of([]), // default items
            this.createLandSearchInput$.pipe(
                distinctUntilChanged(),
                tap(() => this.createLandDataOptionsLoading = true),
                switchMap(term => {
                    return this.lookupsService.loadLands({ term }).pipe(
                        catchError(() => of([])), // empty list on error
                        tap(() => this.createLandDataOptionsLoading = false)
                    );
                })
            )
        );
    }

    loadCreateDeveloperOptions() {
        this.createDeveloperOptions = concat(
            of([]), // default items
            this.createDeveloperSearchInput$.pipe(
                distinctUntilChanged(),
                tap(() => this.createDeveloperDataOptionsLoading = true),
                switchMap(term => {
                    return this.lookupsService.loadDevelopers({ term }).pipe(
                        catchError(() => of([])), // empty list on error
                        tap(() => this.createDeveloperDataOptionsLoading = false)
                    );
                })
            )
        );
    }

    loadCreateProjectsOptions() {
        this.createProjectsOptions = concat(
            of([]), // default items
            this.createProjectsSearchInput$.pipe(
                distinctUntilChanged(),
                tap(() => this.createProjectDataOptionsLoading = true),
                switchMap(term => {
                    const developerId = this.createForm.get('developerId')?.value;
                    return this.lookupsService.loadAllProjects({ term, developerId }).pipe(
                        catchError(() => of([])), // empty list on error
                        tap(() => this.createProjectDataOptionsLoading = false)
                    );
                })
            )
        );
    }

    loadCreateUnitOptions() {
        this.createUnitOptions = concat(
            of([]), // default items
            this.createUnitSearchInput$.pipe(
                distinctUntilChanged(),
                tap(() => this.createUnitDataOptionsLoading = true),
                switchMap(term => {
                    const projectId = this.createForm.get('projectId')?.value;
                    // If no project selected, maybe return empty or all? Assuming project is required for unit lookup
                    if (!projectId && !term) return of([]);

                    return this.lookupsService.loadUnitsOptions({ term, projectId }).pipe(
                        catchError(() => of([])), // empty list on error
                        tap(() => this.createUnitDataOptionsLoading = false)
                    );
                })
            )
        );
    }

    initForms() {
        this.searchForm = this.fb.group({
            landId: [''],
            propertyId: [''],
            projectId: [''],
            unitNumber: [''],
            developerId: ['']
        });

        this.editForm = this.fb.group({
            deedId: ['', Validators.required],
            owners: this.fb.array([])
        });

        this.createForm = this.fb.group({
            propertyId: [''],
            landId: [''],
            developerId: [''],
            projectId: [''],
            unitId: [''],
            owners: this.fb.array([])
        });

        // Add one initial owner row
        this.addOwner();
    }

    setSearchType(type: 'land' | 'project' | 'property') {
        this.searchType = type;
        this.searchForm.reset();
        this.searchResult = [];
        this.propertyDetails = null;
    }

    setCreateSearchType(type: 'land' | 'project' | 'property') {
        this.createSearchType = type;
        // Optional: Reset relevant fields in createForm if needed
        this.createForm.patchValue({
            propertyId: '',
            landId: '',
            developerId: '',
            projectId: '',
            unitId: ''
        });
    }

    onSearch() {
        const output: any = {};
        const val = this.searchForm.value;

        if (this.searchType === 'land') {
            if (!val.landId) {
                this.toastr.error('الرجاء إدخال رقم الأرض');
                return;
            }
            output.landId = val.landId;
        } else if (this.searchType === 'property') {
            if (!val.propertyId) {
                this.toastr.error('الرجاء إدخال رقم العقار');
                return;
            }
            output.propertyId = val.propertyId;
        } else if (this.searchType === 'project') {
            if (!val.projectId || !val.unitNumber) {
                this.toastr.error('الرجاء إدخال رقم المشروع ورقم الوحدة');
                return;
            }
            output.projectId = val.projectId;
            // val.unitNumber from ng-select (bindValue='key') corresponds to Unit ID
            output.unitId = val.unitNumber;

            if (val.developerId) {
                output.developerId = val.developerId;
            }
        }

        this.isLoading = true;
        this.searchResult = [];

        this.deedService.searchByPropertyId(output).subscribe(
            (res: any) => {
                this.isLoading = false;

                // Handle new response format { deeds: [], propertyDetails: {} }
                const deedList = res.deeds || [];
                this.propertyDetails = res.propertyDetails || null;

                // Client-side sorting: Active first, then by Date DESC
                this.searchResult = deedList.sort((a, b) => {
                    // 1. Status Check (Active '1' comes first)
                    if (a.status == '1' && b.status != '1') return -1;
                    if (a.status != '1' && b.status == '1') return 1;

                    // 2. Date Check (Newest first)
                    const dateA = new Date(a.createdAt).getTime();
                    const dateB = new Date(b.createdAt).getTime();
                    return dateB - dateA;
                });
            },
            err => {
                this.isLoading = false;
                this.searchResult = [];
                this.propertyDetails = null;
                this.toastr.error(err.error?.error || 'خطأ في جلب التفاصيل');
            }
        );
    }



    // --- Edit Modal Methods ---

    get editOwners() {
        return this.editForm.get('owners') as FormArray;
    }

    addEditOwner(ownerId: string = '', share: string = '') {
        const ownerGroup = this.fb.group({
            ownerId: [ownerId, Validators.required],
            share: [share, Validators.required]
        });
        this.editOwners.push(ownerGroup);
    }

    removeEditOwner(index: number) {
        this.editOwners.removeAt(index);
    }

    openEditModal(deed: any) {
        console.log('Opening Edit Modal for Deed:', deed);
        this.selectedDeed = deed;
        this.showEditModal = true;

        this.editForm.patchValue({ deedId: deed.id });
        this.editOwners.clear();

        if (deed.details && deed.details.length > 0) {
            deed.details.forEach(detail => {
                this.addEditOwner(detail.ownerId, detail.share || detail.Share);
            });
        } else {
            // If no details (unlikely for active deed), add one empty row
            this.addEditOwner();
        }
    }

    closeEditModal() {
        this.showEditModal = false;
        this.selectedDeed = null;
    }

    onSave() {
        if (this.editForm.invalid) {
            console.log('Form invalid. Value:', this.editForm.value);
            console.log('Deed ID:', this.editForm.get('deedId').value);
            this.toastr.error('الرجاء تعبئة جميع الحقول المطلوبة');
            return;
        }

        this.isLoading = true;
        this.isLoading = true;
        this.deedService.updateDeedOwners(this.editForm.value).subscribe(
            res => {
                this.isLoading = false;
                this.toastr.success('تم تحديث بيانات المالك بنجاح');
                this.closeEditModal();
                this.onSearch(); // Refresh data to get updated list
            },
            err => {
                this.isLoading = false;
                this.toastr.error(err.error?.error || 'خطأ في تحديث البيانات');
            }
        );
    }

    // Create Deed Methods
    get owners() {
        return this.createForm.get('owners') as FormArray;
    }

    addOwner() {
        const ownerGroup = this.fb.group({
            ownerId: ['', Validators.required],
            share: ['', Validators.required]
        });
        this.owners.push(ownerGroup);
    }

    removeOwner(index: number) {
        this.owners.removeAt(index);
    }

    openCreateModal(propertyId?: string) {
        this.showCreateModal = true;
        this.createForm.reset();
        this.owners.clear();
        this.addOwner();

        if (propertyId) {
            this.createForm.patchValue({ propertyId: propertyId });
        }
    }

    closeCreateModal() {
        this.showCreateModal = false;
    }

    onCreateDeed() {
        if (this.createForm.invalid) {
            this.toastr.error('الرجاء تعبئة جميع الحقول المطلوبة');
            return;
        }

        const val = this.createForm.value;
        const submitData = { ...val };

        // Determine correct ID based on createSearchType
        if (this.createSearchType === 'land') {
            if (!val.landId) {
                this.toastr.error('الرجاء اختيار الأرض');
                return;
            }
            submitData.propertyId = val.landId;
        } else if (this.createSearchType === 'project') {
            if (!val.unitId) {
                this.toastr.error('الرجاء اختيار الوحدة');
                return;
            }
            submitData.propertyId = val.unitId;
        } else {
            if (!val.propertyId) {
                this.toastr.error('الرجاء إدخال رقم العقار');
                return;
            }
            submitData.propertyId = val.propertyId;
        }

        if (!val.owners || val.owners.length === 0) {
            this.toastr.error('مطلوب مالك واحد على الأقل');
            return;
        }

        this.isLoading = true;
        this.deedService.createDeed(submitData).subscribe(
            res => {
                this.isLoading = false;
                this.toastr.success('تم إنشاء السند بنجاح. رقم السند الجديد: ' + res.newDeedId);
                this.closeCreateModal();
                this.onSearch(); // Refresh data to show the new deed
            },
            err => {
                this.isLoading = false;
                this.toastr.error(err.error?.error || 'خطأ في إنشاء السند');
            }
        );
    }

    reactivateDeed(deed: any) {
        if (!confirm('هل أنت متأكد من أنك تريد إعادة تفعيل هذا السند وإلغاء تفعيل السند الحالي؟')) {
            return;
        }

        this.isLoading = true;
        // Use database ID (primary key) not visible deed number
        this.deedService.reactivateDeed(deed.id).subscribe(
            res => {
                this.isLoading = false;
                this.toastr.success('تم إعادة تفعيل السند بنجاح');
                this.onSearch(); // Refresh list to show swapped statuses
            },
            err => {
                this.isLoading = false;
                this.toastr.error(err.error?.error || 'خطأ في إعادة تفعيل السند');
            }
        );
    }
}
