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
exports.Payout = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../auth/user/user.entity");
const beneficiary_entity_1 = require("./beneficiary.entity");
const decimal = {
    type: 'numeric',
    precision: 18,
    scale: 6,
    transformer: {
        to: (v) => v,
        from: (v) => (v === null ? null : parseFloat(v)),
    },
};
let Payout = class Payout {
    id;
    reference;
    user;
    beneficiary;
    sourceCurrency;
    sourceAmount;
    targetCurrency;
    targetAmount;
    midRate;
    quotedRate;
    markupPercent;
    fixedFee;
    totalDebit;
    purpose;
    invoiceReference;
    status;
    statusHistory;
    estimatedDelivery;
    createdAt;
    updatedAt;
};
exports.Payout = Payout;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Payout.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Payout.prototype, "reference", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: false, onDelete: 'CASCADE' }),
    __metadata("design:type", user_entity_1.User)
], Payout.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => beneficiary_entity_1.Beneficiary, { nullable: false, eager: true }),
    __metadata("design:type", beneficiary_entity_1.Beneficiary)
], Payout.prototype, "beneficiary", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 3 }),
    __metadata("design:type", String)
], Payout.prototype, "sourceCurrency", void 0);
__decorate([
    (0, typeorm_1.Column)(decimal),
    __metadata("design:type", Number)
], Payout.prototype, "sourceAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 3 }),
    __metadata("design:type", String)
], Payout.prototype, "targetCurrency", void 0);
__decorate([
    (0, typeorm_1.Column)(decimal),
    __metadata("design:type", Number)
], Payout.prototype, "targetAmount", void 0);
__decorate([
    (0, typeorm_1.Column)(decimal),
    __metadata("design:type", Number)
], Payout.prototype, "midRate", void 0);
__decorate([
    (0, typeorm_1.Column)(decimal),
    __metadata("design:type", Number)
], Payout.prototype, "quotedRate", void 0);
__decorate([
    (0, typeorm_1.Column)(decimal),
    __metadata("design:type", Number)
], Payout.prototype, "markupPercent", void 0);
__decorate([
    (0, typeorm_1.Column)(decimal),
    __metadata("design:type", Number)
], Payout.prototype, "fixedFee", void 0);
__decorate([
    (0, typeorm_1.Column)(decimal),
    __metadata("design:type", Number)
], Payout.prototype, "totalDebit", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'CONTRACTOR_PAYMENT' }),
    __metadata("design:type", String)
], Payout.prototype, "purpose", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Payout.prototype, "invoiceReference", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'INITIATED' }),
    __metadata("design:type", String)
], Payout.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: () => "'[]'" }),
    __metadata("design:type", Array)
], Payout.prototype, "statusHistory", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], Payout.prototype, "estimatedDelivery", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Payout.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Payout.prototype, "updatedAt", void 0);
exports.Payout = Payout = __decorate([
    (0, typeorm_1.Entity)()
], Payout);
//# sourceMappingURL=payout.entity.js.map