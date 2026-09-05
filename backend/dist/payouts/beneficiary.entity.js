"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Beneficiary = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../auth/user/user.entity");
let Beneficiary = class Beneficiary {
    id;
    user;
    name;
    type;
    country;
    currency;
    deliveryMethod;
    cardLast4;
    bankName;
    accountNumber;
    swiftCode;
    createdAt;
};
exports.Beneficiary = Beneficiary;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Beneficiary.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: false, onDelete: 'CASCADE' }),
    __metadata("design:type", user_entity_1.User)
], Beneficiary.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Beneficiary.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'INDIVIDUAL' }),
    __metadata("design:type", String)
], Beneficiary.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 2 }),
    __metadata("design:type", String)
], Beneficiary.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 3 }),
    __metadata("design:type", String)
], Beneficiary.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'CARD' }),
    __metadata("design:type", String)
], Beneficiary.prototype, "deliveryMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 4, nullable: true }),
    __metadata("design:type", Object)
], Beneficiary.prototype, "cardLast4", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Beneficiary.prototype, "bankName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Beneficiary.prototype, "accountNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Beneficiary.prototype, "swiftCode", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Beneficiary.prototype, "createdAt", void 0);
exports.Beneficiary = Beneficiary = __decorate([
    (0, typeorm_1.Entity)()
], Beneficiary);
//# sourceMappingURL=beneficiary.entity.js.map