import os
import re
import json
import ast


class RepairEstimationModule:

    def __init__(

        self,

        knowledge_folder="knowledge",

        currency="INR"
    ):

        self.knowledge_folder = (
            knowledge_folder
        )

        self.currency = currency

    # =====================================================
    # JSON HELPERS
    # =====================================================

    def load_json(self, path):

        with open(path, "r") as f:
            return json.load(f)

    def save_json(self, data, path):

        os.makedirs(
            os.path.dirname(path),
             exist_ok=True
        )

        with open(path, "w") as f:

            json.dump(
                data,
                f,
                indent=4
            )

    # =====================================================
    # LOAD KNOWLEDGE FILE
    # =====================================================

    def load_knowledge_file(

        self,

        defect_name
    ):

        file_path = os.path.join(

            self.knowledge_folder,

            f"{defect_name.lower()}.txt"
        )

        if not os.path.exists(file_path):

            print(
                f"[WARNING] Knowledge file not found:"
            )

            print(file_path)

            return None

        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:

            return f.read()

    # =====================================================
    # EXTRACT TAG CONTENT
    # =====================================================

    def extract_tag_content(

        self,

        text,

        tag_name
    ):

        pattern = (
            rf"<{tag_name}>"
            rf"(.*?)"
            rf"</{tag_name}>"
        )

        match = re.search(

            pattern,

            text,

            re.DOTALL
        )

        if not match:
            return None

        return match.group(1).strip()

    # =====================================================
    # PARSE REQUIRED ITEMS
    # =====================================================

    def parse_required_items(

        self,

        required_items_text
    ):

        if required_items_text is None:
            return {}

        try:

            parsed = ast.literal_eval(
                required_items_text
            )

            normalized_items = {}

            for item_name, item_data in (
                parsed.items()
            ):

                # =====================================
                # CLEAN COST
                # =====================================

                raw_cost = item_data.get(
                    "cost",
                    "0"
                )

                numeric_cost = float(

                    re.sub(
                        r"[^0-9.]",
                        "",
                        raw_cost
                    )
                )

                normalized_items[item_name] = {

                    "quantity_per_sqm":

                        float(
                            item_data.get(
                                "quantity_per_sqm",
                                0
                            )
                        ),

                    "metrics":
                        item_data.get(
                            "metrics",
                            "unknown"
                        ),

                    "unit_cost":
                        numeric_cost,

                    "currency":
                        self.currency
                }

            return normalized_items

        except Exception as e:

            print(
                f"[ERROR] Failed to parse "
                f"required items:"
            )

            print(e)

            return {}

    # =====================================================
    # DETERMINE SEVERITY
    # =====================================================

    def determine_severity(

        self,

        segmentation_area_px
    ):

        if segmentation_area_px < 20000:
            return "low"

        elif segmentation_area_px < 80000:
            return "medium"

        else:
            return "high"

    # =====================================================
    # SEVERITY MULTIPLIERS
    # =====================================================

    def get_severity_multiplier(

        self,

        severity
    ):

        severity_multipliers = {

            "low": 1.0,

            "medium": 1.5,

            "high": 2.5
        }

        return severity_multipliers.get(
            severity,
            1.0
        )

    # =====================================================
    # COMPUTE COSTS
    # =====================================================

    def compute_repair_estimation(

        self,

        defect_area,

        severity,

        required_items
    ):

        multiplier = (
            self.get_severity_multiplier(
                severity
            )
        )

        repair_items = []

        total_cost = 0

        for item_name, item_data in (
            required_items.items()
        ):

            quantity_per_sqm = (
                item_data["quantity_per_sqm"]
            )

            unit_cost = (
                item_data["unit_cost"]
            )

            required_quantity = (

                quantity_per_sqm

                *

                defect_area

                *

                multiplier
            )

            item_total_cost = (

                required_quantity

                *

                unit_cost
            )

            total_cost += item_total_cost

        repair_items.append({

            "item_name":
                item_name,

            "quantity_per_sqm":
                round(quantity_per_sqm, 2),

            "metrics":
                item_data["metrics"],

            "unit_cost":
                round(unit_cost, 2),

            "required_quantity":
                round(required_quantity, 2),

            "total_cost":
                round(item_total_cost, 2),

            "currency":
                self.currency
        })


        return {

            "required_items":
                repair_items,

            "estimated_total_cost":
                round(total_cost, 2),

            "currency":
                self.currency
        }

    # =====================================================
    # PROCESS
    # =====================================================

    def process(

        self,

        unique_defect_json_path,

        output_json_path
    ):

        unique_defects = self.load_json(
            unique_defect_json_path
        )

        repair_outputs = {}

        # =================================================
        # GLOBAL SUMMARY
        # =================================================

        total_estimated_cost = 0

        total_material_cost = 0

        total_labor_cost = 0

        total_equipment_cost = 0

        severity_distribution = {

            "low": 0,

            "medium": 0,

            "high": 0
        }

        # =================================================
        # PROCESS EACH DEFECT
        # =================================================

        for persistent_id, defect_data in (
            unique_defects.items()
        ):

            defect_name = (
                defect_data["defect_name"]
            )

            defect_area = (
                defect_data["defect_area"]
            )

            segmentation_area_px = (

                defect_data[
                    "best_segmentation_area_px"
                ]
            )

            # =============================================
            # LOAD KNOWLEDGE
            # =============================================

            knowledge_text = (
                self.load_knowledge_file(
                    defect_name
                )
            )

            if knowledge_text is None:
                continue

            # =============================================
            # PARSE KNOWLEDGE
            # =============================================

            description = (
                self.extract_tag_content(

                    knowledge_text,

                    "description"
                )
            )

            repair_process = (
                self.extract_tag_content(

                    knowledge_text,

                    "repair-process"
                )
            )

            required_items_text = (
                self.extract_tag_content(

                    knowledge_text,

                    "required-items"
                )
            )

            required_items = (
                self.parse_required_items(
                    required_items_text
                )
            )

            # =============================================
            # DETERMINE SEVERITY
            # =============================================

            severity = (
                self.determine_severity(
                    segmentation_area_px
                )
            )

            # =============================================
            # COST ESTIMATION
            # =============================================

            repair_estimation = (
                self.compute_repair_estimation(

                    defect_area,

                    severity,

                    required_items
                )
            )

            estimated_total_cost = (

                repair_estimation[
                    "estimated_total_cost"
                ]
            )

            # =============================================
            # PLACEHOLDER COST SPLITS
            # =============================================

            material_cost = (
                estimated_total_cost * 0.60
            )

            labor_cost = (
                estimated_total_cost * 0.30
            )

            equipment_cost = (
                estimated_total_cost * 0.10
            )

            # =============================================
            # UPDATE GLOBAL SUMMARY
            # =============================================

            total_estimated_cost += (
                estimated_total_cost
            )

            total_material_cost += (
                material_cost
            )

            total_labor_cost += (
                labor_cost
            )

            total_equipment_cost += (
                equipment_cost
            )

            severity_distribution[
                severity
            ] += 1

            # =============================================
            # STRUCTURE OUTPUT
            # =============================================

            repair_outputs[persistent_id] = {

                "persistent_defect_id":
                    persistent_id,

                "defect_name":
                    defect_name,

                "description":
                    description,

                "severity":
                    severity,

                "repair_process":
                    repair_process,

                "repair_estimation": {

                    **repair_estimation,

                    "material_cost":
                        round(material_cost, 2),

                    "labor_cost":
                        round(labor_cost, 2),

                    "equipment_cost":
                        round(equipment_cost, 2)
                },

                "defect_metadata": {

                    "defect_area":
                        defect_area,

                    "area_metrics":

                        defect_data[
                            "area_metrics"
                        ],

                    "best_frame":

                        defect_data[
                            "best_frame"
                        ],

                    "best_frame_path":

                        defect_data[
                            "best_frame_path"
                        ],

                    "overlapping_parts":

                        defect_data[
                            "overlapping_parts"
                        ]
                }
            }

        # =================================================
        # FINAL OUTPUT
        # =================================================

        final_output = {

            "repair_summary": {

                "total_defects":

                    len(repair_outputs),

                "total_estimated_cost":

                    round(total_estimated_cost, 2),

                "total_material_cost":

                    round(total_material_cost, 2),

                "total_labor_cost":

                    round(total_labor_cost, 2),

                "total_equipment_cost":

                    round(total_equipment_cost, 2),


                "currency":

                    self.currency,

                "severity_distribution":

                    severity_distribution
            },

            "defect_repairs":

                repair_outputs
        }

        # =================================================
        # SAVE
        # =================================================

        self.save_json(

            final_output,

            output_json_path
        )

        print(
            f"[INFO] Repair estimation "
            f"outputs saved to:"
        )

        print(output_json_path)

        return final_output



# =========================================================
# TESTING
# =========================================================
"""
if __name__ == "__main__":

    repair_module = (
        RepairEstimationModule(

            knowledge_folder="./repair_process_docs",

            currency="INR"
        )
    )

    outputs = repair_module.process(

        unique_defect_json_path=
            "frame_extraction_testing_outputs/deformation_1/unique_defect_output/unique_defect_outputs.json",

        output_json_path=
            "frame_extraction_testing_outputs/deformation_1/repair_estimation_output/repair_estimation_outputs.json"
    )

    # =====================================================
    # SIMPLE CONSOLE OUTPUT
    # =====================================================

    print("\n")

    print("=" * 60)

    print("VESSEL REPAIR SUMMARY")

    print("=" * 60)

    repair_summary = outputs[
        "repair_summary"
    ]

    print(
        f"Total Defects: "
        f"{repair_summary['total_defects']}"
    )

    print(
        f"Total Estimated Cost: "
        f"{repair_summary['total_estimated_cost']:.2f} "
        f"{repair_summary['currency']}"
    )

    print(
        f"Material Cost: "
        f"{repair_summary['total_material_cost']:.2f} "
        f"{repair_summary['currency']}"
    )

    print(
        f"Labor Cost: "
        f"{repair_summary['total_labor_cost']:.2f} "
        f"{repair_summary['currency']}"
    )

    print(
        f"Equipment Cost: "
        f"{repair_summary['total_equipment_cost']:.2f} "
        f"{repair_summary['currency']}"
    )

    print("\nSeverity Distribution:")

    for severity, count in (

        repair_summary[
            "severity_distribution"
        ].items()
    ):

        print(
            f"- {severity}: {count}"
        )

    print("\n")

    print("=" * 60)

    print("INDIVIDUAL DEFECT REPAIRS")

    print("=" * 60)

    defect_repairs = outputs[
        "defect_repairs"
    ]

    for persistent_id, repair_data in (
        defect_repairs.items()
    ):

        print("\n")

        print(
            f"Persistent Defect ID: "
            f"{persistent_id}"
        )

        print(
            f"Defect Name: "
            f"{repair_data['defect_name']}"
        )

        print(
            f"Severity: "
            f"{repair_data['severity']}"
        )

        print("\nRepair Process:\n")

        print(
            repair_data["repair_process"]
        )

        print("\nRequired Items:\n")

        total_cost = (

            repair_data[
                "repair_estimation"
            ][
                "estimated_total_cost"
            ]
        )

        for item in (

            repair_data[
                "repair_estimation"
            ][
                "required_items"
            ]
        ):

            print(
                f"- {item['item_name']}"
            )

            print(
                f"  Quantity Needed: "
                f"{item['required_quantity']:.2f} "
                f"{item['metrics']}"
            )

            print(
                f"  Unit Cost: "
                f"{item['unit_cost']} "
                f"{item['currency']}"
            )

            print(
                f"  Total Cost: "
                f"{item['total_cost']:.2f} "
                f"{item['currency']}"
            )

            print("")

        print(
            f"Estimated Total Cost: "
            f"{total_cost:.2f} "
            f"{repair_module.currency}"
        )

        print("\n" + "=" * 60)
"""