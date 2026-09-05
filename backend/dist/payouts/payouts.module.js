"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayoutsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const payouts_controller_1 = require("./payouts.controller");
const payouts_service_1 = require("./payouts.service");
const fx_service_1 = require("./fx.service");
const payout_entity_1 = require("./payout.entity");
const beneficiary_entity_1 = require("./beneficiary.entity");
const user_entity_1 = require("../auth/user/user.entity");
const wallet_entity_1 = require("../wallet/wallet.entity");
let PayoutsModule = class PayoutsModule {
};
exports.PayoutsModule = PayoutsModule;
exports.PayoutsModule = PayoutsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([payout_entity_1.Payout, beneficiary_entity_1.Beneficiary, user_entity_1.User, wallet_entity_1.Wallet])],
        controllers: [payouts_controller_1.PayoutsController],
        providers: [payouts_service_1.PayoutsService, fx_service_1.FxService],
        exports: [payouts_service_1.PayoutsService],
    })
], PayoutsModule);
//# sourceMappingURL=payouts.module.js.map