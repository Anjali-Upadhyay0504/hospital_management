from django.contrib import admin

# # Register your models here.
# from django.contrib import admin
# from .models import Invoice


# @admin.register(Invoice)
# class InvoiceAdmin(admin.ModelAdmin):

#     list_display = (
#         "invoice_number",
#         "patient",
#         "doctor",
#         "total_amount",
#         "payment_status",
#         "created_at",
#     )

#     list_filter = (
#         "payment_status",
#     )

#     search_fields = (
#         "invoice_number",
#         "patient__username",
#         "doctor__user__username",
#     )