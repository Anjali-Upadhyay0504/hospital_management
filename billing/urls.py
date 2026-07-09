from django.urls import path
from .views import InvoiceAPIView, InvoiceDetailAPIView,MarkInvoicePaidAPIView




urlpatterns = [

    path(
        "",
        InvoiceAPIView.as_view(),
        name="invoice-list"
    ),

    path(
        "<int:pk>/",
        InvoiceDetailAPIView.as_view(),
        name="invoice-detail"
    ),

    path(
        "<int:pk>/mark-paid/",
        MarkInvoicePaidAPIView.as_view(),
        name="mark-invoice-paid"
    ),

]