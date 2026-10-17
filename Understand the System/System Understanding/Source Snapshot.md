---
title: "Source Snapshot"
date: 2026-10-17
tags:
  - akad
  - system-understanding
status: current-source-reviewed
---

# Source Snapshot

**Guide:** [Start Here](Start%20Here.md) · [System Overview](System%20Overview.md) · [Glossary](Glossary.md) · [Known Limits](Current%20Implementation%20Gaps.md)

## Baseline

Documentation was checked against Git commit `26791d46fabd9551c3ad53b4431afb594f38065b` on 2026-10-17. The manifest covers all 40 API PHP files, both base SQL files, all 14 JavaScript files, and all 18 admin HTML files. Hashes identify this checkout; they do not describe a live server or database.

| Source file | SHA-256 |
| --- | --- |
| `api/addons.php` | `b36e80e739742b1743bfdfdd89d00fe9fe33eceb84886a82e0213fa96f1226f2` |
| `api/audit.php` | `e4575f3a88c2deca259fea6f7a957afad39c3283edd37f10ad2652c9ae1873ca` |
| `api/auth.php` | `dfcb78783b48355092d7ff720e3054f5543c28929bf937f9deeff4906cbbf1c6` |
| `api/availability_service.php` | `45da223d973ca6aedfa23975352e601ba6dd5fd8589be92d97ea7b7722691ffb` |
| `api/availabilityBlocks.php` | `2a855590f6a5a277e33f0ee0b300e560fa6238c7476a509291d374f8461c1557` |
| `api/booking_items_service.php` | `705cbab8a3cf32d7f2ce965208269c65055f4499920bf414dacdb4d2ffa9a0cf` |
| `api/booking_pricing.php` | `bee4ed53698851b383984c889d523b95e6013ba680ab1717ea95210d03fa085e` |
| `api/booking_service.php` | `3f04f3730451032071887b5e312c57b23444194461789ed554324dd2fd66a176` |
| `api/bookingItems.php` | `67c534053b4de9d1a7531a3c131d843b7646ba584b942519abde268b9f5615e9` |
| `api/bookings.php` | `975cd42d9a7f86427bc166e4c689733627fa0caba862be2de0f9d2691e5da662` |
| `api/catalog_definitions.php` | `240155aac37cfd7520053a7a8a69127dfffdbe3dc53e2027bffdd6e1ecc72f7f` |
| `api/categories.php` | `c4fa14f34fe98d09de1f00562f8b954f1498aef5e5e924b05bebf24617c2a3a5` |
| `api/checklist_service.php` | `454495cd809f76cc30a262390e42a79015a0b01cf2d048e0a4aede619d28ec48` |
| `api/checklistTemplates.php` | `748e5eed3d6568f041961c8e45ae4b374be5023a6ef13b97e196f7a6e05aade4` |
| `api/config.php` | `ad9f3550166f69ed79a7882ab3173fe51d51f147226a68d0d4167e3d88ac65ee` |
| `api/crud.php` | `f866ed2ad5941d9422f412d42b17292bbebee8b22bde8b3de36f07a1f2aef8e1` |
| `api/customers.php` | `8ce5f8603c3e960c89b85a8d9e128de304c28813ad2eda898c0748c843023a87` |
| `api/delivery.php` | `849a0a6c46459e2cf658edfaa34e1c6c61e2079e7e65182833faa6b00269a807` |
| `api/deposit_service.php` | `1b9efd9167c3a489b68c11179a879421a325ff6e1904bd592d2a2792a697ee4d` |
| `api/deposits.php` | `e9a03fc9465fca214cab3ad7ce838a22f837090cbc82717d10980a1079a32314` |
| `api/domain.php` | `34d2ecad5ad8480adde770985812de67eec60e31cf08e9a33ce8dc1f34df2182` |
| `api/equipment_service.php` | `9fd620927623bb30ace19d16a05b4f936244dca0f60c1e0a7ac8900f8e211793` |
| `api/equipment.php` | `984c8072c1bce064a958265cbb4e894690890ed774419a467d13f8a1fbef6670` |
| `api/gallery-upload.php` | `8adf6e4ce021329dd8a42a406649ec927514521ebb6de4e82796f6fc6ddcbf5d` |
| `api/gallery.php` | `bf83ca4ae06d2f2e434589009dc02f07ac53ad29b1fde5f352e1a5c342c999db` |
| `api/itemHistory.php` | `b221c49af290c16fb965432328019bd1cd5fae644523ddf63754d39c3a49e4c0` |
| `api/itemReleases.php` | `f31124f3d7816262f11290a1643b07f49da06ed91de7b66b235a87e47a9f2727` |
| `api/notifications.php` | `59622b2e9e46c129a2eeca6720229c09e353ff5a3e76da5db21b48ae25f9bd96` |
| `api/owners.php` | `6d054870e5e9e8f4ad003ae2e165ea94ab6a2c6f64214923d7e91dbbe074169c` |
| `api/packages.php` | `72e4bf4016883d4d132b288e59440a2692bea21b54d0516bd75dfbc517a5e5be` |
| `api/payment_service.php` | `e8475c8235dcac5fbcd0b85c709f56924a298333a9b8c52ec0d073088f116816` |
| `api/payments.php` | `5a22982385719092d81262558ac425e7de6621d4ead6f215ebf95eb06e5175e6` |
| `api/rentalItems.php` | `5d026013e5e5fb9d3eeefbdf4b5aa862fdfa8d01331c5305c1da0ffb4a3a3b4b` |
| `api/reports.php` | `a05228d3f5bd8c9603fa1e1af912b6e7906b33a80031c12b0845a2510676a0db` |
| `api/services.php` | `f756f701ab9ce1b8999716048b962a9488d6079cb8c205a772814face32f1637` |
| `api/settings.php` | `d87c9ef9f09cd845f1b6e49277ce2275c5dd7bb35515bc96d5f6bdaed3bdddfd` |
| `api/supporting_service.php` | `5c89c6814484b58ca5be77c8040cf74b541d08c29f58de311d9e6e574749f838` |
| `api/sync_state.php` | `cf13bf729014224f76a4e9ba9ed598ebacea4ac0d9b007af9f8e57abecc2f6a2` |
| `api/sync.php` | `7dcf0405ae404e5db89555fa6e7f076e0dd63e238ff09c95d7b95136652b2694` |
| `api/websiteContent.php` | `38619461d8a9b549333445367113cf21d998f604435670eb9db481ed9a71f5f7` |
| `db/schema.sql` | `201506aa4e34bcaf0248c243fa5619761b7aa4b7573c21002bcd418e62241f79` |
| `db/seed.sql` | `937b7f6cb96ef9a19ecd575fe0750861478f0376de2be82b8194dea7c22b0714` |
| `js/admin.js` | `114a460a0ed5569fb69ff4dea2925b6bb0b5e5a1206d4bd987faf5c915977570` |
| `js/api.js` | `04fca4708e187deac69d8c347fd5769d15268988e7e3d6347fb9f450fd8ec1b0` |
| `js/app.js` | `10246984573ef23ae907b57d72ad15a2328c8115459142405352cae7ac8a6f1f` |
| `js/bookings.js` | `b78210c2cb39aa948d1d85e5c58d884371abdeb620f3d972b15c754f74908311` |
| `js/calendar.js` | `bfce9a4713a1d24734c125951933574c0965ac235d0a5e4e323a5c561e1d9e48` |
| `js/config.js` | `309d2c542d2510247f631844adba0ce6a75b963046508547e4a0bd4a76264374` |
| `js/customers.js` | `0b3985675a0c17e22df34b252d0b2ecaace382505f361f394c2adf95e6903fdd` |
| `js/inventory.js` | `0dd06e7bf7fc1e6ee1159ff955512b7785a2e8255b4ef73710910b32d49f025b` |
| `js/offline.js` | `55f2ce8be3c8c5212bf213c6130c3d157d183496dfe4f38c3d8d804904ad1e44` |
| `js/payments.js` | `f6377bf4b204a821d44954f4006cd727c8e12f3e3259fb2f843a8c27ff868389` |
| `js/services.js` | `37051ef9ed7ace1d8dba69ba79cf0fb16b3d3fd958a4501a4a15e6b57909d055` |
| `js/storage.js` | `c00826f5183f0132e13f73c82431902aa430de33f8252a1431f0777524f037f3` |
| `js/sync-ui.js` | `db181d396a42c99f27be12198a36f115caa37e72cca0f88bb8f4044314183958` |
| `js/sync.js` | `e2f890485e45a8dedddf180f00390d95d3dfb2deae08b1dfe899cccc6fbae3a7` |
| `admin/addons.html` | `22408b042d704cf04a10f17d87554fab654a79e3110146f2a38a416a398fb607` |
| `admin/audit.html` | `5e1e7a36ba0e3d6f7af1c9e9cb7c6da5a3eb142edf7e03c8d55b999d2d4362b1` |
| `admin/bookings.html` | `5bc147166fbdd609b5c8c01a3f96366021267bcc6fa618f2a5aaa66f81e490d5` |
| `admin/calendar.html` | `823e47abd3c7c7d4cf6f5f230679f41493d153661a30d3881d66119252ccba42` |
| `admin/categories.html` | `4c4facfe9eed26d6b77c8c6ad5f0461dcc6d4c11171af57b31c060abbabb5e12` |
| `admin/content.html` | `0a552fd47173214eb9359a01ab2e32fba7d664f5fbc136e105c0c9f6abfcb571` |
| `admin/customers.html` | `b274c735c4404cc12720fdeff218352ae18d4333ebde9d410ce0df4fc1ad5137` |
| `admin/dashboard.html` | `07b9682b1aeef29baac6b0162ba082e038e86dd1d3053b6475cb18f83c621e7d` |
| `admin/gallery.html` | `0f466320859a0f922a2d5bea6c4327ac3049542f952db6d09de784470b494c48` |
| `admin/inventory.html` | `dcd34a9380d56be1eb8bb777dcfa7c7e047f11fdb289dfe314a13445e9fc1166` |
| `admin/login.html` | `c60640c2fb4361fc5e4fb5cc9e98ad7fc8c3a12aebb0a73b94a0107df0147d1d` |
| `admin/manual-booking.html` | `9cd3b2a4f9de5992a792cc1e463e3744222350200474a69310be9f51b9bae70f` |
| `admin/owners.html` | `9528fd2df2a62ae41afa9e9eee55da6aa784a71f7725e7f5ca32555471e829db` |
| `admin/packages.html` | `b30962d1e7ecb0670950ed02bde406844981e6196a03d5b0815c842fcfac5bb3` |
| `admin/payments.html` | `4acfff18af01170625344cc8edfd4d7a6726001cc4e7a2a17b95f8c1b43595a3` |
| `admin/reports.html` | `37904f3ec33c553d2615f093b630b568abeab5e5a0d6d8773dd96dee6aa359a1` |
| `admin/services.html` | `ad12c48a82a272429943620500126ef001cbd181891e1995ea31188df2849014` |
| `admin/settings.html` | `4fada4b900aeb728ec60db25076483365d25e284ca55eaafd471bfb5a80be89a` |
