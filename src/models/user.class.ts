import { Contact } from "./contact.class";

export class User {
    company: string;
    firstName: string;
    lastName: string;
    mail: string;
    phone: string;
    birthDate?: number;
    street: string;
    zipCode: number;
    city: string;
    country: string;
    image: string;
    contacts: Contact[];


    constructor(obj?: any) {
        this.company = obj ? obj.company : '';
        this.firstName = obj ? obj.firstName : '';
        this.lastName = obj ? obj.lastName : '';
        this.mail = obj ? obj.mail : '';
        this.phone = obj ? obj.phone : '';
        this.birthDate = obj ? obj.birthDate : '';
        this.street = obj ? obj.street : '';
        this.zipCode = obj ? obj.zipCode : '';
        this.city = obj ? obj.city : '';
        this.country = obj ? obj.country : '';
        this.image = obj ? obj.image : '';
        this.contacts = [];
        // this.contacts = obj && obj.contacts 
        //     ? obj.contacts.map((contact: any) => new Contact(contact)) 
        //     : [];
    }

}