import type { BrandAdapter } from "../core/brand.ts";

export const joieBrandAdapter = {
  id: "joie",
  name: "Joie",
  environments: [
    {
      id: "uk-dev",
      label: "Joie UK Dev",
      market: "UK",
      storefrontUrl: "https://joiebaby.dev/uk/",
      allowedOrigins: ["https://joiebaby.dev"],
      allowedPathPrefixes: ["/uk/"],
    },
    {
      id: "uk-staging",
      label: "Joie UK Staging",
      market: "UK",
      storefrontUrl: "https://joie.stg.wonderland.tw/uk/",
      allowedOrigins: ["https://joie.stg.wonderland.tw"],
      allowedPathPrefixes: ["/uk/"],
    },
  ],
  features: [
    {
      featureId: "pdp-behavior",
      selectors: {
        productForm: "#product_addtocart_form",
        productSkuAttribute: "data-product-sku",
        title: "h1",
        price: "[data-role='priceBox']",
        gallery: "[data-gallery-role='gallery-placeholder']",
        variantOptions: "input[type='radio'][name^='super_attribute']",
        addToBag: "button[title='add to bag']",
        outOfStock: "button[title='out of stock']",
        galleryNext: "button[aria-label='Next']",
        galleryFullscreen:
          "button[aria-label='Click to view image in fullscreen']",
        preselectComponent: "[x-init*='initPdpPreselect']",
        renderedSku: "[itemprop='sku'], .product-info-stock-sku .sku .value",
      },
      rules: {
        preselect: {
          attributeCode: "color",
          noHashPriority: ["configured-preselect", "first-option"],
        },
        inStock: {
          variantControl: "visible-selectable",
          addToBag: "visible-enabled",
          outOfStock: "not-primary",
        },
        outOfStock: {
          variantControl: "visible-selectable",
          addToBag: "hidden-or-disabled",
          outOfStock: "visible-enabled",
        },
        verifyGallery: true,
        addFirstSalableVariantToCart: true,
      },
    },
  ],
} as const satisfies BrandAdapter;
