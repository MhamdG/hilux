import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../authentication.service';
import {Router, ActivatedRoute} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {environment} from '../../../../environments/environment';
import {find, tap} from 'rxjs/operators';
import {FieldsService} from '../../fields.service';
 import permissionList from '../../../permission';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

    userloggedIn: boolean = false;
    searchData: any = {query: ''};
    query: string = '';
    roles$: object;
    userRole:any;
    

    constructor(
        private authenticationService: AuthenticationService,
        private router: Router,
        private toastr: ToastrService,
        private route: ActivatedRoute,
        private fieldsService: FieldsService,
    ) {
    }

    ngOnInit(): void {
        this.authenticationService.isLoggedIn().subscribe((data) => {
            this.userloggedIn = data;
            this.roles$ = this.fieldsService.getUrl(`${environment.apiHost}/AjmanLandProperty/index.php/applications/getUserRights`)
            .subscribe((res) => {
              this.userRole = res;
            });
        });
      


        // this.router.events.subscribe((url: any) => {
        //   const queryFromUrl = this.getUrlParams(window.location.href)
        //   this.searchData.query = queryFromUrl['query'] ||this.query
        // });

        // this.route.queryParams
        //   .subscribe(params => {
        //     const query = params['query'];
        //     const queryFromUrl = this.getUrlParams(window.location.href)
        //     if(query && query !== '') {
        //       this.searchData.query = query;
        //     }
        //     if(queryFromUrl['query'] && queryFromUrl['query'] !== '') {
        //       this.searchData.query = queryFromUrl['query']
        //     }
        //   });
    }

    log(val) {
        console.log(val);
    }

    logout() {
        this.authenticationService.signout().subscribe((data) => {
            if (data.status == 'success') {
                this.toastr.success('Successfully Logged out', 'Success');
                this.router.navigate(['/login']);
                location.reload();
            } else {
                this.toastr.error(data.message, 'Error');
            }
        });
    }

    getRole(data: any, permission: string) {
        // console.log('user role');
        // console.log(data);
        // console.log('permission');
        // console.log(permission);
      return Object.keys(data).includes(permission);
    }
    checkRole( permission: string) {
        var pList = permissionList[permission];
        var d =Object.values(this.userRole)[0].toString().toLowerCase()
        if ( ! pList) return false;
        else if(pList.includes(d)) return true;
         else return false;
    }

    onSearchSubmit(searchData: any) {
        this.query = searchData.query || '';
        // this.router.navigate(['/search'], {
        //   queryParams: { query: searchData.query },
        //   queryParamsHandling: 'merge'
        // });
    }

    getUrlParams(search) {
        const hashes = search.slice(search.indexOf('?') + 1).split('&');
        const params = {};
        hashes.map(hash => {
            const [key, val] = hash.split('=');
            params[key] = decodeURIComponent(val);
        });
        return params;
    }

}
