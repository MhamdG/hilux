import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class DeedService {
    private baseUrl = environment.apiHost + '/AjmanLandProperty/index.php/Deed';

    constructor(private http: HttpClient) { }

    searchByPropertyId(params: any): Observable<any> {
        return this.http.get(`${this.baseUrl}/SearchByPropertyId`, { params });
    }

    updateDeedOwners(data: any): Observable<any> {
        const params = new URLSearchParams();
        params.append('deedId', data.deedId);

        if (data.owners && Array.isArray(data.owners)) {
            data.owners.forEach((owner: any, index: number) => {
                params.append(`owners[${index}][ownerId]`, owner.ownerId);
                params.append(`owners[${index}][share]`, owner.share);
            });
        }

        const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
        return this.http.post(`${this.baseUrl}/UpdateDeedOwners`, params.toString(), { headers });
    }

    createDeed(data: any): Observable<any> {
        const params = new URLSearchParams();
        params.append('propertyId', data.propertyId);

        if (data.owners && Array.isArray(data.owners)) {
            data.owners.forEach((owner: any, index: number) => {
                params.append(`owners[${index}][ownerId]`, owner.ownerId);
                params.append(`owners[${index}][share]`, owner.share);
            });
        }

        const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
        return this.http.post(`${this.baseUrl}/CreateDeed`, params.toString(), { headers });
    }

    reactivateDeed(deedId: string): Observable<any> {
        const params = new URLSearchParams();
        params.append('deedId', deedId);
        const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
        return this.http.post(`${this.baseUrl}/ReactivateDeed`, params.toString(), { headers });
    }
}
